"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CheckCheck, Terminal, Cpu,
  TrendingUp, Mail, Share2, MessageCircle,
  Landmark, FileBarChart, Brain, Webhook,
  LogOut, Zap, X, type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface NavItem { href: string; label: string; icon: LucideIcon; badge?: number }

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard/overview",  label: "Dashboard",      icon: LayoutDashboard },
      { href: "/dashboard/approvals", label: "Approvals",      icon: CheckCheck },
      { href: "/dashboard/logs",      label: "Activity Logs",  icon: Terminal },
      { href: "/dashboard/services",  label: "AI Bots",        icon: Cpu },
    ],
  },
  {
    label: "Send & Post",
    items: [
      { href: "/dashboard/email",    label: "Send Email",      icon: Mail },
      { href: "/dashboard/social",   label: "Social Media",    icon: Share2 },
      { href: "/dashboard/whatsapp", label: "WhatsApp",        icon: MessageCircle },
      { href: "/dashboard/webhooks", label: "Webhooks",        icon: Webhook },
    ],
  },
  {
    label: "Finance & Reports",
    items: [
      { href: "/dashboard/finance",  label: "Finance",         icon: TrendingUp },
      { href: "/dashboard/bank",     label: "Bank Monitor",    icon: Landmark },
      { href: "/dashboard/briefing", label: "CEO Report",      icon: FileBarChart },
      { href: "/dashboard/rag",      label: "AI Search",       icon: Brain },
    ],
  },
];

const sidebarVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.035 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface SidebarProps {
  open?:    boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, username, isAdmin } = useAuth();

  const content = (
    <aside className="relative flex h-full w-[256px] flex-col overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(9,11,31,0.98) 0%, rgba(2,4,15,0.99) 100%)" }}
      />
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      {/* Right border */}
      <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />

      <div className="relative flex flex-col h-full z-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-3 px-5 pt-5 pb-4"
        >
          {/* Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-lg opacity-70" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_4px_14px_rgba(99,102,241,0.5)]">
              <Zap className="h-[17px] w-[17px] text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold text-white tracking-tight leading-none">AI Employee</div>
            <div className="text-[10px] mt-[3px] font-medium leading-none text-indigo-400/60">Operations Hub</div>
          </div>

          {/* Mobile close */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden rounded-lg p-1.5 text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Admin badge */}
          {isAdmin && (
            <span className="hidden lg:inline-flex text-[8.5px] font-bold uppercase tracking-widest rounded-md border px-1.5 py-0.5"
              style={{ color: "#a78bfa", borderColor: "rgba(167,139,250,0.25)", background: "rgba(167,139,250,0.08)" }}>
              Admin
            </span>
          )}
        </motion.div>

        {/* Top divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-2" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4" style={{ scrollbarWidth: "none" }}>
          {NAV_GROUPS.map(({ label, items }, gi) => (
            <motion.div
              key={label}
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: gi * 0.06 }}
            >
              <p className="nav-group-label px-3 mb-1.5">{label}</p>
              <div className="space-y-[2px]">
                {items.map(({ href, label: itemLabel, icon: Icon }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <motion.div key={href} variants={itemVariants}>
                      <Link
                        href={href}
                        onClick={onClose}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-[9px] text-[13px] font-medium",
                          "transition-all duration-150",
                          active
                            ? "nav-item-active text-indigo-300"
                            : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[15px] w-[15px] shrink-0 transition-colors duration-150",
                            active ? "text-indigo-400" : "text-slate-600 group-hover:text-indigo-400",
                          )}
                          strokeWidth={active ? 2.5 : 2}
                        />
                        <span className="flex-1 truncate">{itemLabel}</span>
                        {active && (
                          <motion.span
                            layoutId="nav-active-dot"
                            className="h-1.5 w-1.5 rounded-full bg-indigo-400"
                            style={{ boxShadow: "0 0 8px rgba(99,102,241,0.9)" }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </nav>

        {/* Bottom divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {/* User footer */}
        <div className="p-3">
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-all duration-150 group cursor-default">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold uppercase text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)]">
                {username?.[0] ?? "?"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-[9px] w-[9px] rounded-full bg-emerald-400 border-2 border-[#090B1F] shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-semibold text-slate-200 truncate leading-none">{username ?? "—"}</p>
              <p className="text-[10px] text-slate-600 mt-[3px] leading-none">{isAdmin ? "Administrator" : "User"}</p>
            </div>

            <button
              onClick={() => logout()}
              title="Sign out"
              className="shrink-0 rounded-lg p-1.5 text-slate-700 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: fixed */}
      <div className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[256px]">
        {content}
      </div>

      {/* Mobile: slide-over */}
      <AnimatePresence>
        {open && onClose && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              key="sidebar-drawer"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[256px]"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
