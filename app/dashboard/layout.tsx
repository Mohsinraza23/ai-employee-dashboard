"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { DryRunProvider } from "@/context/dry-run-context";
import { Sidebar } from "@/components/layout/sidebar";
import { SafetyBanner } from "@/components/layout/safety-banner";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { ready, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 40%, #000000 100%)" }}
      >
        <div className="relative flex flex-col items-center gap-4">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl animate-pulse-glow scale-150" />
          <Spinner size="lg" className="relative text-indigo-400" />
          <p className="text-xs text-slate-600 font-medium tracking-wider uppercase animate-pulse">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <DryRunProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex flex-1 flex-col lg:pl-[256px] min-w-0">
          <SafetyBanner />
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 flex flex-col"
          >
            {/* Inject menu toggle into each page via context-like prop pattern:
                Pages use Topbar which receives onMenuToggle from here via layout */}
            {/* We pass the toggle handler as a wrapper component trick */}
            <MobileMenuInjector onMenuToggle={() => setSidebarOpen(o => !o)}>
              {children}
            </MobileMenuInjector>
          </motion.div>
        </div>
      </div>
    </DryRunProvider>
  );
}

// Simple context to pass mobile menu toggle to Topbar inside pages
import { createContext, useContext } from "react";
export const MobileMenuCtx = createContext<(() => void) | null>(null);
export function useMobileMenu() { return useContext(MobileMenuCtx); }

function MobileMenuInjector({ children, onMenuToggle }: { children: React.ReactNode; onMenuToggle: () => void }) {
  return (
    <MobileMenuCtx.Provider value={onMenuToggle}>
      {children}
    </MobileMenuCtx.Provider>
  );
}
