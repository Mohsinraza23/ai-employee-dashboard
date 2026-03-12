"use client";

import { motion } from "framer-motion";
import { ServiceCard } from "./service-card";
import { Spinner } from "@/components/ui/spinner";
import { Server } from "lucide-react";
import type { Process } from "@/types/api";

interface ServiceGridProps {
  processes:    Process[] | null;
  loading:      boolean;
  onRefreshed?: () => void;
}

export function ServiceGrid({ processes, loading, onRefreshed }: ServiceGridProps) {
  if (loading && !processes) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Spinner size="md" className="text-indigo-400" />
      </div>
    );
  }

  if (!processes || processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-zinc-600">
        <Server className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">No PM2 processes found</p>
      </div>
    );
  }

  const getStatus = (p: Process) => p.pm2_status ?? p.status;
  const online  = processes.filter(p => getStatus(p) === "online").length;
  const errored = processes.filter(p => ["stopped", "errored"].includes(getStatus(p))).length;
  const degraded = processes.length - online - errored;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          {online} online
        </span>
        {degraded > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {degraded} degraded
          </span>
        )}
        {errored > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            {errored} offline
          </span>
        )}
      </div>

      <motion.div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      >
        {processes.map(p => (
          <motion.div
            key={p.name}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.3 }}
          >
            <ServiceCard process={p} onRestarted={onRefreshed} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
