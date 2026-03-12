"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDryRun } from "@/context/dry-run-context";
import { useAuth } from "@/context/auth-context";
import { ShieldCheck, FlaskConical, Zap, AlertTriangle } from "lucide-react";

const bannerVariants = {
  initial: { opacity: 0, y: -12, height: 0 },
  animate: { opacity: 1, y: 0,   height: "auto", transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
  exit:    { opacity: 0, y: -8,  height: 0,    transition: { duration: 0.2 } },
};

export function LiveBanner() {
  const { isDryRun, demoMode, toggleDemoMode, toggleDryRun, loading } = useDryRun();
  const { isAdmin } = useAuth();

  const bannerType = demoMode ? "demo" : isDryRun ? "dry" : "live";

  const configs = {
    demo: {
      gradient: "linear-gradient(90deg, #1e1b4b 0%, #312e81 45%, #3730a3 100%)",
      icon: FlaskConical,
      label: "Demo Mode",
      desc: "All actions are simulated. Nothing real will execute.",
      action: "Exit Demo",
      onAction: toggleDemoMode,
    },
    dry: {
      gradient: "linear-gradient(90deg, #0c2444 0%, #0c4a6e 45%, #1e3a5f 100%)",
      icon: ShieldCheck,
      label: "Dry Run",
      desc: "Safe mode active. No emails, posts, or payments will execute.",
      action: "Go LIVE →",
      onAction: toggleDryRun,
    },
    live: {
      gradient: "linear-gradient(90deg, #450a0a 0%, #7f1d1d 45%, #991b1b 100%)",
      icon: Zap,
      label: "LIVE MODE",
      desc: "Real emails, social posts & payments are executing.",
      action: "Switch to Dry Run",
      onAction: toggleDryRun,
    },
  };

  const cfg = configs[bannerType];
  const Icon = cfg.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={bannerType}
        variants={bannerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative overflow-hidden"
        style={{ background: cfg.gradient }}
      >
        {/* Grid texture overlay */}
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

        {/* Glow for live mode */}
        {bannerType === "live" && (
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.15), transparent 70%)" }} />
        )}

        <div className="relative flex items-center justify-between gap-3 px-6 py-2.5">
          <div className="flex items-center gap-3">
            {/* Live pulsing dot */}
            {bannerType === "live" && (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
              </span>
            )}
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
              <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              {cfg.label}
            </span>
            <span className="hidden text-xs text-white/50 sm:inline">{cfg.desc}</span>
          </div>

          {(bannerType !== "dry" || isAdmin) && (bannerType !== "live" || isAdmin) && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={cfg.onAction}
              disabled={loading}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {bannerType === "live" && <AlertTriangle className="h-3 w-3" />}
              {cfg.action}
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
