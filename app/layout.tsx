import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Please forgive me... 🥺👉👈",
  description:
    "A tiny, soft, kawaii apology with floating hearts and a wish I owe you. 💖",
  openGraph: {
    title: "Please forgive me... 🥺",
    description: "I made something cute to apologize. Will you forgive me?",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFE6EC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Fonts are loaded via plain <link> so the dev server doesn't need
            outbound TLS to Google — works in restricted networks. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Caveat:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="font-rounded antialiased min-h-screen">{children}</body>
    </html>
  );
}
