import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DashboardWrapper } from "./UI/layout/DashboardLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: process.env.EXT_PUBLIC_PROJECT_NAME || "British Private Tutors",
    template: `%s | ${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
  },
  description: "Inspiring young minds",

  // OpenGraph data for social shares
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    description: "Inspiring young minds",
    type: "website",
    url: process.env.NEXT_PUBLIC_PROJECT_URL,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_PROJECT_URL}/logo.png`,
        alt: "Inspiring young minds",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: `@${process.env.NEXT_PUBLIC_PROJECT_NAME}`,
    title: process.env.NEXT_PUBLIC_PROJECT_NAME,
    description: "Your one-stop solution ...",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_PROJECT_URL}/logo.png`,
        alt: "British Private Tutors - Inspiring young minds",
      },
    ],
  },
  // Additional example: canonical link (if you want)
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_PROJECT_URL}`,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_PROJECT_URL || "britishprivatetutors.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DashboardWrapper>{children}</DashboardWrapper>
        <ToastContainer />
      </body>
    </html>
  );
}
