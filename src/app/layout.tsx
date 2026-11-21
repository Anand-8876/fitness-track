import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", subsets: ["latin"], weight: ["500", "700", "900"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitTrack — AI macro & fitness tracker",
  description: "Snap your food for instant macros, track calories, workouts, weight and physique progress.",
  appleWebApp: { capable: true, title: "FitTrack", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#050000",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
