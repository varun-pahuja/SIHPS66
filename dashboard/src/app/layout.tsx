import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OceanEmbed — Subsurface Ocean Temperature Reconstruction",
  description:
    "Deep learning framework for reconstructing depth-wise subsurface ocean temperature from surface satellite observations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900">
        {children}
      </body>
    </html>
  );
}
