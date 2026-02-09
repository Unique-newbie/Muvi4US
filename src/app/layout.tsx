import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/components/auth";
import { LockdownChecker, AnnouncementBanner } from "@/components/admin";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "Muvi4US - Stream Movies & TV Shows",
  description: "Discover and watch your favorite movies, TV shows, and anime. Stream content for free with Muvi4US.",
  keywords: ["movies", "tv shows", "anime", "streaming", "watch online", "free movies"],
  openGraph: {
    title: "Muvi4US - Stream Movies & TV Shows",
    description: "Discover and watch your favorite movies, TV shows, and anime.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-black font-sans text-white antialiased`}
      >
        <AuthProvider>
          <Suspense fallback={null}>
            <LockdownChecker />
          </Suspense>
          <AnnouncementBanner />
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] pb-20 md:pb-0">
            {children}
          </main>
          {/* Footer - hidden on mobile */}
          <footer className="hidden border-t border-white/10 bg-black py-8 md:block">
            <div className="container mx-auto px-4 text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Muvi4US. For educational purposes only.</p>
              <p className="mt-2">All content is provided by third-party services. We do not host any media.</p>
            </div>
          </footer>
          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
