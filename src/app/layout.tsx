import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import "./globals.css";
import { MobileNavBar } from "@/components/MobileNavBar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import EnhancedActivityTracker from "@/components/EnhancedActivityTracker";
import { Toaster } from 'sonner';
import { NotificationSetup } from "@/components/NotificationSetup";
import WelcomeVideoModal from "@/components/WelcomeVideoModal";


const vazir = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazir",
  weight: ["400", "500", "700"],
  display: "swap",
});

// متادیتا برای PWA
export const metadata: Metadata = {
  title: "Leitner System",
  description: "سیستم لایتنر برای یادگیری لغات",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192x192.png",
    icon: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Leitner System",
  },
};

// viewport برای PWA
export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        {/* اضافه کردن لینک‌های PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Leitner System" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* اضافه کردن متا تگ‌های بیشتر برای PWA */}
        <meta name="application-name" content="Leitner System" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${vazir.variable} font-sans antialiased bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300`}>
        <ThemeProvider>
          <SessionProvider session={session}>
          {session?.user?.id && (
              <NotificationSetup userId={session.user.id} />
            )}
          <EnhancedActivityTracker />
            {children}
            <Toaster
              position="top-right"
              dir="rtl"
              expand={false}
              richColors
              closeButton
              duration={5000}
              toastOptions={{
                classNames: {
                  toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                  description: 'group-[.toast]:text-muted-foreground',
                  actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                  cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
              }}
            />
            <MobileNavBar />
            <PWAInstallPrompt />
            <OfflineIndicator />
            <WelcomeVideoModal />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}