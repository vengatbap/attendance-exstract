import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendance Management System",
  description: "Internal attendance parser, dashboard, and Excel reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full font-sans text-slate-900">{children}</body>
    </html>
  );
}
