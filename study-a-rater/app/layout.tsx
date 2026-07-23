import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const metadataBase = host ? new URL(`${protocol}://${host}`) : undefined;
  const description =
    "A de-identified research instrument for rating website screenshots.";

  return {
    metadataBase,
    title: {
      default: "Website perception study",
      template: "%s | Website perception study",
    },
    description,
    robots: {
      index: false,
      follow: false,
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      title: "Website perception study",
      description,
      images: ["/og.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Website perception study",
      description,
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
