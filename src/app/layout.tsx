import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_Display, Anaheim } from "next/font/google";
import "../index.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

const notoSansDisplay = Noto_Sans_Display({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-display",
});

const anaheim = Anaheim({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anaheim",
});

export const metadata: Metadata = {
  title: "Solstice",
  description: "Book crypto-native fitness classes. Earn $SLST for every session.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${notoSansDisplay.variable} ${anaheim.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
