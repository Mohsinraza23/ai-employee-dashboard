"use client";

import { useState } from "react";
import { api, safeCall } from "@/lib/api";
import { useAction } from "@/hooks/use-action";
import { usePoll } from "@/hooks/use-poll";
import { WARN } from "@/lib/warnings";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { useAuth } from "@/context/auth-context";
import { Brain, Search, RefreshCw, Sparkles, Clock } from "lucide-react";

export default function RagPage() {
  const { isAdmin } = useAuth();
  const [query,    setQuery]    = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [querying, setQuerying] = useState(false);

  const status = usePoll({ fetcher: api.ragStatus, interval: 30_000 });

  async function handleQuery() {
    if (!query.trim()) return;
    setQuerying(true);
    setResponse(null);
    const { data, error } = await safeCall(() => api.ragQuery(query));
    if (error) {
      setResponse(`Error: ${error}`);
    } else {
      setResponse(data?.stdout?.trim() ?? data?.message ?? "(no output)");
    }
    setQuerying(false);
  }

  const reindex = useAction(
    api.ragReindex,
    {
      successMsg: "Vault reindex started in the background",
      confirm: WARN.ragReindex(),
    },
  );

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={status.refresh} refreshing={status.loading} lastRefresh={status.lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-3xl">

        <PageHeader
          icon={Brain}
          title="AI Memory"
          accent="purple"
          description="Semantic search over your Obsidian vault using vector embeddings"
        />

        {/* Status bar */}
        <Card className="!p-0">
          <CardContent className="py-3.5 px-5 flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${status.data?.running ? "bg-emerald-400" : "bg-amber-400"}`}
                style={status.data?.running ? { boxShadow: "0 0 6px rgba(52,211,153,0.8)" } : {}} />
              <span className="text-sm text-slate-400">RAG engine</span>
              {status.loading && !status.data ? (
                <Spinner size="sm" className="text-slate-600" />
              ) : (
                <Badge variant={status.data?.running ? "success" : "warning"}>
                  {status.data?.running ? "running" : "idle"}
                </Badge>
              )}
            </div>
            {status.data?.last_run && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Clock className="h-3 w-3" />
                Last indexed: {new Date(status.data.last_run).toLocaleString()}
              </div>
            )}
            {status.error && (
              <span className="text-xs text-red-400">{status.error}</span>
            )}
          </CardContent>
        </Card>

        {/* Query */}
        <Card glow>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Search className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <CardTitle>Query Vault</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              rows={4}
              placeholder="Ask a question about your vault… e.g. 'What tasks are overdue?'"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleQuery();
              }}
            />
            <div className="flex items-center justify-between gap-3">
              <kbd className="text-[11px]">⌘ + Enter to query</kbd>
              <Button
                variant="gradient"
                loading={querying}
                disabled={!query.trim()}
                onClick={handleQuery}
                className="gap-2"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {querying ? "Querying…" : "Ask RAG"}
              </Button>
            </div>

            {(querying || response !== null) && (
              <div className="rounded-xl overflow-hidden border border-white/[0.08]" style={{ background: "rgba(2,4,15,0.8)" }}>
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
                  <Brain className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-xs font-medium text-slate-400">Response</span>
                </div>
                <div className="p-4 min-h-[80px]">
                  {querying ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Spinner size="sm" className="text-purple-400" />
                      Querying vault…
                    </div>
                  ) : (
                    <pre className="text-emerald-300 text-xs leading-5 font-mono whitespace-pre-wrap break-words">
                      {response}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reindex */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <CardTitle>Rebuild Vector Index</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-6">
            <p className="text-sm text-slate-400 leading-relaxed">
              Crawls all{" "}
              <code className="text-xs bg-white/[0.07] px-1.5 py-0.5 rounded text-slate-300 font-mono">AI_Employee_Vault/</code>{" "}
              markdown files and rebuilds the vector search index. Runs in a background thread — no downtime.
            </p>
            <Button
              variant="outline"
              loading={reindex.loading}
              disabled={!isAdmin}
              title={!isAdmin ? "Admin required" : undefined}
              onClick={() => reindex.run()}
              className="shrink-0 gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reindex Vault
            </Button>
          </CardContent>
        </Card>

        {!isAdmin && (
          <InfoBanner variant="warning">
            Admin access is required to reindex the vault.
          </InfoBanner>
        )}
      </main>
    </div>
  );
}
