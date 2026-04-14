"use client";

import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavFooter = pathname === "/login" || pathname === "/register";

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        {!hideNavFooter && <Navbar />}
        <main className="flex-1">{children}</main>
        {!hideNavFooter && <Footer />}
      </div>
    </AuthProvider>
  );
}
