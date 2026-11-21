import type { SVGProps } from "react";

/** Thin-line neon icons. They inherit `currentColor`, so style them with text-* classes. */
type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...p }: P) {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
      {children}
    </svg>
  );
}

export const IconPlate = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="3.5" />
    <path d="M2 4v5a1.5 1.5 0 0 0 3 0V4M3.5 4v16M22 4c-1.7 0-2.5 2-2.5 5s1 3 2.5 3v8" />
  </Svg>
);
export const IconDumbbell = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
  </Svg>
);
export const IconChart = (p: P) => (
  <Svg {...p}>
    <path d="M3 3v18h18" />
    <path d="m7 14 4-4 3 3 6-6" />
  </Svg>
);
export const IconUser = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </Svg>
);
export const IconCamera = (p: P) => (
  <Svg {...p}>
    <path d="M3 8h3.5L8 5.5h8L17.5 8H21v11H3z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </Svg>
);
export const IconUpload = (p: P) => (
  <Svg {...p}>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" />
  </Svg>
);
export const IconText = (p: P) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h10M4 18h13" />
  </Svg>
);
export const IconPen = (p: P) => (
  <Svg {...p}>
    <path d="M16 3.5 20.5 8 8 20.5H3.5V16z" />
  </Svg>
);
export const IconDrop = (p: P) => (
  <Svg {...p}>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
  </Svg>
);
export const IconBolt = (p: P) => (
  <Svg {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Svg>
);
export const IconTarget = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </Svg>
);
export const IconScan = (p: P) => (
  <Svg {...p}>
    <path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5M3 12h18" />
  </Svg>
);
export const IconShield = (p: P) => (
  <Svg {...p}>
    <path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);
export const IconSpark = (p: P) => (
  <Svg {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  </Svg>
);
export const IconArrow = (p: P) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const IconChevron = ({ left, ...p }: P & { left?: boolean }) => (
  <Svg {...p}>
    <path d={left ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
  </Svg>
);
export const IconClose = (p: P) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
