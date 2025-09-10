import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieConsent from '@/components/CookieConsent';
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

// Fonts are defined via CSS variables in globals.css to avoid next/font runtime

export const metadata: Metadata = {
  title: "NexaSec - Cybersecurity Solutions",
  description: "Comprehensive cybersecurity solutions for businesses in Rwanda and East Africa",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" />
              <CookieConsent />
              <ServiceWorkerRegistration />
            </AuthProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
