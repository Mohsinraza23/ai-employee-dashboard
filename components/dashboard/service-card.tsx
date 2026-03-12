"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RotateCcw, Cpu, HardDrive, RefreshCw, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { showConfirm } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Process } from "@/types/api";

type Health = "ok" | "warn" | "error" | "unknown";

function getHealth(p: Process): Health {
  if (["stopped", "errored", "stopping"].includes(p.pm2_status)) return "error";
  if (["launching", "one-launch-status"].includes(p.pm2_status))  return "warn";
  if (p.pm2_status === "online") {
    if ((p.restarts ?? 0) >= 10 || (p.cpu ?? 0) > 85 || (p.memory ?? 0) > 300 * 1_048_576) return "warn";
    return "ok";
  }
  return "unknown";
}

const healthConfig: Record<Health, {
  badge:   "success" | "warning" | "danger" | "default";
  label:   string;
  dot:     string;
  dotGlow: string;
  border:  string;
}> = {
  ok:      { badge: "success", label: "online",   dot: "bg-emerald-400", dotGlow: "shadow-[0_0_6px_rgba(52,211,153,0.8)]",  border: "border-white/[0.06]" },
  warn:    { badge: "warning", label: "degraded", dot: "bg-amber-400",   dotGlow: "shadow-[0_0_6px_rgba(251,191,36,0.8)]",   border: "border-amber-500/20" },
  error:   { badge: "danger",  label: "offline",  dot: "bg-red-400",     dotGlow: "shadow-[0_0_6px_rgba(248,113,113,0.8)]",  border: "border-red-500/20" },
  unknown: { badge: "default", label: "unknown",  dot: "bg-zinc-500",    dotGlow: "",                                         border: "border-white/[0.06]" },
};

interface ServiceCardProps {
  process:      Process;
  onRestarted?: () => void;
}

export function ServiceCard({ process: p, onRestarted }: ServiceCardProps) {
  const [logsOpen,    setLogsOpen]    = useState(false);
  const [logLines,    setLogLines]    = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [restarting,  setRestarting]  = useState(false);

  const health = getHealth(p);
  const cfg    = healthConfig[health];

  const memMb   = p.memory ? (p.memory / 1_048_576).toFixed(0) : "—";
  const cpu     = p.cpu != null ? `${p.cpu.toFixed(1)}%` : "—";
  const restarts = p.restarts ?? 0;

  async function toggleLogs() {
    if (logsOpen) { setLogsOpen(false); return; }
    setLogsOpen(true);
    setLogsLoading(true);
    try {
      const res = await api.serviceLogs(p.name);
      setLogLines(res.lines ?? []);
    } catch {
      setLogLines(["Error loading logs."]);
    } finally {
      setLogsLoading(false);
    }
  }

  async function handleRestart() {
    const ok = await showConfirm({
      title: `Restart ${p.name}?`,
      body: "The service will restart and may briefly drop connections.",
      severity: "warning",
      confirmText: "Restart",
    });
    if (!ok) return;
    setRestarting(true);
    try { await api.restartService(p.name); onRestarted?.(); }
    catch { /* parent re-polls */ }
    finally { setRestarting(false); }
  }

  function colorLine(line: string) {
    if (/error|fail|crash/i.test(line)) return "error";
    if (/warn/i.test(line)) return "warn";
    return "info";
  }

  return (
    <div className={cn(
      "glass rounded-2xl overflow-hidden border transition-all duration-200",
      "hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
      cfg.border,
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", cfg.dot, cfg.dotGlow)} />
        <span className="flex-1 text-sm font-medium text-zinc-200 truncate">{p.name}</span>
        <Badge variant={cfg.badge} dot={false} glow>{cfg.label}</Badge>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 border-t border-white/[0.04]">
        {[
          { icon: Cpu,       label: "CPU",  value: cpu,                 danger: (p.cpu ?? 0) > 85 },
          { icon: HardDrive, label: "RAM",  value: `${memMb}M`,         danger: (p.memory ?? 0) > 300 * 1_048_576 },
          { icon: RefreshCw, label: "↻",    value: restarts,            danger: restarts >= 10, warn: restarts >= 5 },
          { icon: Activity,  label: "PID",  value: p.pid ?? "—" },
        ].map(({ label, value, danger, warn }) => (
          <div key={label} className="flex flex-col items-center py-2.5 gap-0.5">
            <span className={cn(
              "text-[12px] font-bold leading-none",
              danger ? "text-red-400" : warn ? "text-amber-400" : "text-zinc-300",
            )}>
              {value}
            </span>
            <span className="text-[9px] text-zinc-600 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 border-t border-white/[0.04] px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          loading={restarting}
          onClick={handleRestart}
          className="text-xs gap-1 text-zinc-500 hover:text-zinc-200"
        >
          <RotateCcw className="h-3 w-3" />
          Restart
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLogs}
          className="ml-auto text-xs gap-1 text-zinc-600 hover:text-zinc-300"
        >
          Logs
          <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", logsOpen && "rotate-180")} />
        </Button>
      </div>

      {/* Log pane */}
      <AnimatePresence>
        {logsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.04]"
          >
            <div className="bg-zinc-950/80 max-h-36 overflow-y-auto p-3">
              {logsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner size="sm" className="text-zinc-600" />
                </div>
              ) : logLines.length === 0 ? (
                <p className="text-xs text-zinc-700 text-center py-2">No log output</p>
              ) : (
                <div className="space-y-px">
                  {logLines.map((line, i) => (
                    <p key={i} className={`log-line ${colorLine(line)}`}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
