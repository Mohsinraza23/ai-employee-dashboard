"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ShieldAlert, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showConfirm } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";
import { truncate, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ApprovalItem } from "@/types/api";

interface ApprovalListProps {
  items:      ApprovalItem[];
  onChanged?: () => void;
}

type ActionState = { stem: string; action: "approve" | "reject" } | null;

const riskConfig = {
  high:   { variant: "danger"  as const, icon: ShieldAlert, border: "border-red-500/20 hover:border-red-500/40", bg: "bg-red-500/5", glow: "rgba(239,68,68,0.06)" },
  medium: { variant: "warning" as const, icon: Clock,       border: "border-amber-500/20 hover:border-amber-500/40", bg: "bg-amber-500/5", glow: "rgba(245,158,11,0.06)" },
  low:    { variant: "default" as const, icon: Clock,       border: "border-white/[0.06] hover:border-white/10", bg: "bg-white/[0.02]", glow: "transparent" },
};

export function ApprovalList({ items, onChanged }: ApprovalListProps) {
  const [pending, setPending] = useState<ActionState>(null);

  async function doApprove(stem: string) {
    const ok = await showConfirm({
      title: "Approve this action?",
      body: `Stem: ${stem}`,
      severity: "warning",
      confirmText: "Approve",
    });
    if (!ok) return;
    setPending({ stem, action: "approve" });
    try   { await api.approve(stem); onChanged?.(); }
    finally { setPending(null); }
  }

  async function doReject(stem: string) {
    const ok = await showConfirm({
      title: "Reject this action?",
      body: `Stem: ${stem} — this will be marked as rejected.`,
      severity: "warning",
      confirmText: "Reject",
    });
    if (!ok) return;
    setPending({ stem, action: "reject" });
    try   { await api.reject(stem); onChanged?.(); }
    finally { setPending(null); }
  }

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16"
      >
        <div className="relative mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
          </div>
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
        </div>
        <p className="text-base font-semibold text-zinc-300">All clear</p>
        <p className="mt-1 text-sm text-zinc-600">Nothing awaiting your approval</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3 p-6">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => {
          const risk      = (item.risk ?? "low") as keyof typeof riskConfig;
          const rCfg      = riskConfig[risk] ?? riskConfig.low;
          const isWorking = pending?.stem === item.stem;
          const approving = isWorking && pending?.action === "approve";
          const rejecting = isWorking && pending?.action === "reject";

          return (
            <motion.div
              key={item.stem}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={cn(
                "group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200",
                rCfg.border, rCfg.bg,
              )}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at 0% 50%, ${rCfg.glow}, transparent 70%)` }}
              />

              {/* Risk icon */}
              <rCfg.icon className={cn(
                "relative mt-0.5 h-4 w-4 shrink-0",
                risk === "high" ? "text-red-400" : risk === "medium" ? "text-amber-400" : "text-zinc-500"
              )} />

              {/* Content */}
              <div className="relative flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate leading-snug">
                  {truncate(item.action ?? item.stem, 70)}
                </p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-zinc-500 truncate">
                    {truncate(item.description, 90)}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {item.risk && (
                    <Badge variant={rCfg.variant} dot glow>
                      {item.risk} risk
                    </Badge>
                  )}
                  {(item.created_at ?? item.created) && (
                    <span className="text-[11px] text-zinc-600">
                      {timeAgo(item.created_at ?? item.created!)}
                    </span>
                  )}
                  {item.user && (
                    <span className="text-[11px] text-zinc-600">by {item.user}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex items-center gap-2 shrink-0">
                <Button
                  variant="gradient"
                  size="sm"
                  loading={approving}
                  onClick={() => doApprove(item.stem)}
                  className="gap-1"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={rejecting}
                  onClick={() => doReject(item.stem)}
                  className="text-red-400 hover:bg-red-500/10 gap-1"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
