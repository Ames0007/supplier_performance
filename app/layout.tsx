import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PublicDemoBanner } from "@/components/layout";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "UM6P SPM",
    template: "%s · UM6P SPM",
  },
  description:
    "UM6P Supplier Performance Management — plateforme de gestion de la performance fournisseurs.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {/* Public Development Mode banner (renders nothing when the mode is off). */}
          <div className="flex h-dvh flex-col">
            <PublicDemoBanner />
            <div className="min-h-0 flex-1">{children}</div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
