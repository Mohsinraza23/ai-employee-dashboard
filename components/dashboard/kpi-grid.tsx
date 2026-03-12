"use client";

import { Server, Clock, Wallet, CreditCard } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { usd } from "@/lib/utils";
import type { SystemResponse, TasksResponse, FinanceResponse } from "@/types/api";

interface KpiGridProps {
  system:  SystemResponse | null;
  tasks:   TasksResponse   | null;
  finance: FinanceResponse | null;
  loading: boolean;
}

export function KpiGrid({ system, tasks, finance, loading }: KpiGridProps) {
  const onlineCount  = system?.processes?.filter(p => p.pm2_status === "online").length ?? 0;
  const totalCount   = system?.processes?.length ?? 0;
  const allGood      = totalCount > 0 && onlineCount === totalCount;
  const pendingTasks = tasks?.inbox ?? 0;
  const netBalance   = finance?.net_balance ?? finance?.net ?? 0;
  const monthSpend   = finance?.monthly_spend ?? finance?.expenses ?? (finance as any)?.expense ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <DashboardCard
        icon={Server}
        accent={allGood ? "emerald" : onlineCount === 0 ? "red" : "amber"}
        label="Services Online"
        value={loading && !system ? 0 : `${onlineCount} / ${totalCount}`}
        description="PM2 daemons"
        loading={loading && !system}
        delay={0}
      />
      <DashboardCard
        icon={Clock}
        accent={pendingTasks > 5 ? "red" : pendingTasks > 0 ? "amber" : "indigo"}
        label="Pending Tasks"
        value={loading && !tasks ? 0 : pendingTasks}
        description={`${(tasks?.recent ?? tasks?.tasks ?? []).length} total`}
        loading={loading && !tasks}
        delay={0.08}
      />
      <DashboardCard
        icon={Wallet}
        accent={netBalance >= 0 ? "emerald" : "red"}
        label="Net Balance"
        value={loading && !finance ? 0 : usd(netBalance)}
        description="All time"
        loading={loading && !finance}
        delay={0.16}
      />
      <DashboardCard
        icon={CreditCard}
        accent="violet"
        label="Monthly Spend"
        value={loading && !finance ? 0 : usd(monthSpend)}
        description="This month"
        loading={loading && !finance}
        delay={0.24}
      />
    </div>
  );
}
