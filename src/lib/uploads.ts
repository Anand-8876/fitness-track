import "server-only";
import { randomBytes } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { HttpError } from "./auth";

// Uploads live outside /public and are served through /api/photos, which
// checks that the requester owns the file.
export const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;
export type ImageType = keyof typeof IMAGE_TYPES;

const MAX_BYTES = 8 * 1024 * 1024;

export function assertImage(file: unknown): asserts file is File {
  if (!(file instanceof File) || file.size === 0) throw new HttpError(400, "Image is required");
  if (!(file.type in IMAGE_TYPES)) throw new HttpError(400, "Use a JPEG, PNG, WebP or GIF image");
  if (file.size > MAX_BYTES) throw new HttpError(400, "Image must be under 8 MB");
}

/** Saves an image and returns its path relative to UPLOAD_ROOT: "<userId>/<kind>/<file>". */
export async function saveImage(userId: string, kind: "physique" | "food", file: File) {
  assertImage(file);
  const dir = path.join(UPLOAD_ROOT, userId, kind);
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${IMAGE_TYPES[file.type as ImageType]}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), bytes);
  return { relPath: `${userId}/${kind}/${name}`, bytes, mimeType: file.type as ImageType };
}

/** Resolves a stored relative path, refusing anything outside the user's own folder. */
export function resolveOwnedPath(userId: string, relPath: string): string {
  const full = path.resolve(UPLOAD_ROOT, relPath);
  const userDir = path.resolve(UPLOAD_ROOT, userId) + path.sep;
  if (!full.startsWith(userDir)) throw new HttpError(404, "Not found");
  return full;
}

export async function readOwnedImage(userId: string, relPath: string) {
  const ext = path.extname(relPath).slice(1);
  const mimeType = (Object.entries(IMAGE_TYPES).find(([, e]) => e === ext)?.[0] ?? "image/jpeg") as ImageType;
  const bytes = await readFile(resolveOwnedPath(userId, relPath));
  return { bytes, mimeType };
}
