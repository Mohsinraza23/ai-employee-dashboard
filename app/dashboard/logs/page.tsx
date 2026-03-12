"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { Terminal, PauseCircle, PlayCircle } from "lucide-react";

type Filter = "all" | "error" | "warn" | "info";

function lineLevel(line: string): "error" | "warn" | "info" | null {
  if (/error|fail|traceback|exception/i.test(line)) return "error";
  if (/warn/i.test(line))                             return "warn";
  if (/info|start|stop|restart/i.test(line))          return "info";
  return null;
}

const FILTER_DEFS: { key: Filter; label: string; count?: number }[] = [
  { key: "all",   label: "All" },
  { key: "error", label: "Errors" },
  { key: "warn",  label: "Warnings" },
  { key: "info",  label: "Info" },
];

export default function LogsPage() {
  const [filter,     setFilter]     = useState<Filter>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, loading, refresh, lastFetch } = usePoll({
    fetcher:  () => api.logs(200),
    interval: 5_000,
  });

  const rawLines = (data?.lines ?? []).map(l =>
    typeof l === "string" ? l : `[${l.level}] ${l.msg}`
  );

  const lines = rawLines.filter(line => {
    if (filter === "all")   return true;
    if (filter === "error") return /error|fail|traceback|exception/i.test(line);
    if (filter === "warn")  return /warn/i.test(line);
    if (filter === "info")  return /info|start|stop|restart/i.test(line);
    return true;
  });

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length, autoScroll]);

  const counts = {
    all:   rawLines.length,
    error: rawLines.filter(l => /error|fail|traceback|exception/i.test(l)).length,
    warn:  rawLines.filter(l => /warn/i.test(l)).length,
    info:  rawLines.filter(l => /info|start|stop|restart/i.test(l)).length,
  };

  return (
    <div className="flex flex-col min-h-full">
      <Topbar onRefresh={refresh} refreshing={loading} lastRefresh={lastFetch} />

      <main className="flex-1 p-4 sm:p-6 flex flex-col space-y-4 animate-fade-up">

        <div className="flex items-start justify-between gap-4">
          <PageHeader
            icon={Terminal}
            title="Live Logs"
            accent="cyan"
            description="Real-time system action stream — updates every 5 seconds"
            className="mb-0 flex-1"
          />
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full p-1">
              {FILTER_DEFS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`pill-tab ${filter === f.key ? "active" : ""}`}
                >
                  {f.label}
                  {counts[f.key] > 0 && (
                    <span className={`ml-1 tabular-nums ${filter === f.key ? "text-indigo-300" : "text-slate-600"}`}>
                      {counts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Log viewer */}
        <Card className="flex flex-col" style={{ height: "calc(100vh - 220px)" }} hover={false}>
          <CardHeader className="shrink-0">
            <CardTitle className="flex items-center gap-2">
              <span
                className={`inline-flex h-2 w-2 rounded-full ${loading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
                style={!loading ? { boxShadow: "0 0 6px rgba(52,211,153,0.7)" } : {}}
              />
              {loading ? "Fetching…" : `${lines.length} lines`}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoScroll(v => !v)}
              className={`gap-1.5 text-xs ${autoScroll ? "text-indigo-400" : "text-slate-500"}`}
            >
              {autoScroll
                ? <><PauseCircle className="h-3.5 w-3.5" /> Auto-scroll</>
                : <><PlayCircle className="h-3.5 w-3.5" /> Paused</>}
            </Button>
          </CardHeader>

          <div className="flex-1 overflow-y-auto rounded-b-2xl" style={{ background: "rgba(2,4,15,0.8)" }}>
            {loading && !data ? (
              <div className="flex justify-center py-16">
                <Spinner size="md" className="text-slate-600" />
              </div>
            ) : lines.length === 0 ? (
              <div className="empty-state">
                <Terminal className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm text-slate-600">
                  {rawLines.length > 0 ? "No lines match this filter." : "No log output yet."}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-px font-mono text-[11.5px]">
                {lines.map((line, i) => {
                  const level = lineLevel(line);
                  return (
                    <p
                      key={i}
                      className={
                        level === "error" ? "log-line error" :
                        level === "warn"  ? "log-line warn" :
                        level === "info"  ? "log-line info" :
                        "log-line"
                      }
                    >
                      {line}
                    </p>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
