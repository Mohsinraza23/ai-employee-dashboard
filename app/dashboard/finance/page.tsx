"use client";

import { motion } from "framer-motion";
import { usePoll } from "@/hooks/use-poll";
import { api } from "@/lib/api";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

interface FinKpiProps {
  label:    string;
  value:    number;
  period?:  string;
  positive?: boolean;
  icon:     React.ElementType;
  gradient: string;
  glow:     string;
}

function FinKpi({ label, value, period, positive, icon: Icon, gradient, glow }: FinKpiProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 group hover:border-white/15 transition-all duration-300 hover:-translate-y-1`}
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
        style={{ background: glow }} />
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}
          style={{ boxShadow: `0 4px 12px ${glow}` }}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2} />
        </div>
        {positive !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1 ${
            positive
              ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
              : "text-red-300 bg-red-500/10 border border-red-500/20"
          }`}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          </div>
        )}
      </div>
      <div className="metric-value">{fmt(value)}</div>
      <div className="mt-1.5 text-sm font-medium text-slate-400">{label}</div>
      {period && <div className="mt-0.5 text-[11px] text-slate-600">{period}</div>}
    </div>
  );
}

export default function FinancePage() {
  const { data, loading, error, lastFetch, refresh } = usePoll({
    fetcher:  () => api.finance(),
    interval: 30_000,
  });

  const net      = data?.net ?? data?.net_balance ?? 0;
  const income   = data?.income ?? 0;
  const expenses = data?.expense ?? data?.expenses ?? 0;
  const txList   = data?.entries ?? data?.transactions ?? [];
  const alerts   = data?.alerts ?? [];

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={refresh} refreshing={loading} lastRefresh={lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-5xl">

        <PageHeader
          icon={DollarSign}
          title="Finance"
          accent="emerald"
          description="Revenue, expenses, and transaction ledger"
        />

        {error && <InfoBanner variant="danger">{error}</InfoBanner>}

        {loading && !data && (
          <div className="flex items-center justify-center py-24">
            <Spinner size="lg" className="text-emerald-400" />
          </div>
        )}

        {data && (
          <>
            {/* KPI row */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <FinKpi
                label="Total Income"
                value={income}
                period={data.month}
                positive
                icon={TrendingUp}
                gradient="from-emerald-500 to-teal-600"
                glow="rgba(16,185,129,0.5)"
              />
              <FinKpi
                label="Total Expenses"
                value={expenses}
                period={data.month}
                positive={false}
                icon={TrendingDown}
                gradient="from-red-500 to-rose-600"
                glow="rgba(239,68,68,0.5)"
              />
              <FinKpi
                label="Net Balance"
                value={net}
                period="All time"
                positive={net >= 0}
                icon={DollarSign}
                gradient={net >= 0 ? "from-indigo-500 to-purple-600" : "from-rose-500 to-red-700"}
                glow={net >= 0 ? "rgba(99,102,241,0.5)" : "rgba(239,68,68,0.5)"}
              />
            </motion.div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <CardTitle>Finance Alerts</CardTitle>
                  </div>
                  <Badge variant="warning">{alerts.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  {alerts.map((alert, i) => (
                    <InfoBanner key={i} variant="warning">{alert}</InfoBanner>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Transactions */}
            <Card glow>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Badge variant="default">{txList.length} entries</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {txList.length === 0 ? (
                  <div className="empty-state">
                    <DollarSign className="h-10 w-10 text-slate-700 mb-3" />
                    <p className="text-sm text-slate-600">No transactions found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {txList.map((tx, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-7 w-7 shrink-0 flex items-center justify-center rounded-lg ${
                            tx.type === "income"
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-red-500/10 border border-red-500/20"
                          }`}>
                            {tx.type === "income"
                              ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                              : <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{tx.description}</p>
                            <p className="text-xs text-slate-600">{tx.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          <Badge variant={tx.type === "income" ? "success" : "danger"} className="hidden sm:inline-flex">
                            {tx.type}
                          </Badge>
                          <span className={`text-sm font-bold tabular-nums ${
                            tx.type === "income" ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {tx.type === "income" ? "+" : "−"}{fmt(Math.abs(tx.amount))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
