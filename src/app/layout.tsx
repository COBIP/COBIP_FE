import type { Metadata } from "next";
import { AdminAccessRouter } from "@/components/AdminAccessRouter";
import "./globals.css";

export const metadata: Metadata = {
  title: "COBIP Frontend",
  description: "Next.js 16 frontend workspace for the COBIP project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground font-sans"
      >
        <AdminAccessRouter />
        {children}
      </body>
    </html>
  );
}
