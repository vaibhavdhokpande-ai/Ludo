import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ludo — Play Online",
  description: "A Ludo King style Ludo game built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/2.47.0/iconfont/tabler-icons.min.css"
        />
      </head>
      <body className="font-sans" style={{ fontFamily: "Nunito, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
