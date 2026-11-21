// Dates are handled as local "YYYY-MM-DD" strings chosen by the client, so a
// day's log matches the user's own calendar regardless of server timezone.

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(ds: string, n: number): string {
  const d = new Date(ds + "T12:00:00");
  d.setDate(d.getDate() + n);
  return localDateStr(d);
}

export function formatDate(ds: string, opts: Intl.DateTimeFormatOptions): string {
  return new Date(ds + "T12:00:00").toLocaleDateString("en-IN", opts);
}

/** 0 = Monday … 6 = Sunday */
export function dayIndex(ds: string): number {
  return (new Date(ds + "T12:00:00").getDay() + 6) % 7;
}
