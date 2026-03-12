"use client";

import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { usePoll } from "@/hooks/use-poll";
import { useAction } from "@/hooks/use-action";
import { useAuth } from "@/context/auth-context";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { Landmark, UploadCloud, CheckCircle, FileSearch, FileText, Clock } from "lucide-react";

export default function BankPage() {
  const { isAdmin } = useAuth();

  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState<string | null>(null);
  const [dragOver,     setDragOver]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, loading, error, lastFetch, refresh } = usePoll({
    fetcher:  () => api.bankStatus(),
    interval: 20_000,
  });

  const bankTest = useAction(
    () => api.bankTest(),
    {
      successMsg: "Anomaly test complete — check logs for results",
      confirm: { title: "Run anomaly test?", body: "Runs the bank watcher against the current CSV queue in dry-run mode.", severity: "warning", confirmText: "Run Test" },
    },
  );

  async function handleUpload(file: File) {
    setUploading(true); setUploadError(null); setUploadedName(null);
    try {
      const res = await api.bankUpload(file);
      if (res.ok) {
        setUploadedName(res.filename ?? file.name);
        setTimeout(refresh, 1_000);
      } else {
        setUploadError((res as { error?: string }).error ?? "Upload failed");
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const pm2Status = data?.pm2?.pm2_status ?? data?.pm2?.status ?? "unknown";

  const statItems = data ? [
    { label: "CSV Queue",    value: `${data.csv_count} file${data.csv_count !== 1 ? "s" : ""}`, icon: FileText },
    { label: "Last Report",  value: data.last_report ?? "None",                                  icon: Clock },
    { label: "Uptime",       value: data.pm2?.uptime ?? "—",                                     icon: FileSearch },
  ] : [];

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={refresh} lastRefresh={lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-2xl">

        <div className="flex items-start justify-between gap-4">
          <PageHeader
            icon={Landmark}
            title="Bank & Finance"
            accent="amber"
            description="Upload bank CSVs and detect anomalous transactions"
            className="mb-0 flex-1"
          />
          {data && (
            <Badge variant={pm2Status === "online" ? "success" : pm2Status === "stopped" ? "default" : "danger"} dot={pm2Status === "online"}>
              {pm2Status}
            </Badge>
          )}
        </div>

        {error && <InfoBanner variant="danger">{error}</InfoBanner>}

        {loading && !data && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-amber-400" />
          </div>
        )}

        {data && (
          <Card glow>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Landmark className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <CardTitle>Bank Watcher</CardTitle>
              </div>
              <Badge variant={pm2Status === "online" ? "success" : "danger"} dot>{pm2Status}</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {statItems.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className="h-3.5 w-3.5 text-slate-600" />
                      <span className="stat-label">{label}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200 truncate">{value}</p>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <div className="pt-1 border-t border-white/[0.06]">
                  <Button variant="secondary" size="sm" loading={bankTest.loading} onClick={() => bankTest.run()} className="gap-1.5">
                    <FileSearch className="h-3.5 w-3.5" /> Run Anomaly Test
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card glow>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <UploadCloud className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <CardTitle>Upload Bank CSV</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`upload-zone flex flex-col items-center justify-center px-6 py-12 text-center ${dragOver ? "dragover" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleUpload(f); }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
              >
                {uploading ? (
                  <><Spinner size="md" className="text-indigo-400 mb-3" /><p className="text-sm text-slate-400">Uploading…</p></>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-slate-600 mb-3" />
                    <p className="text-sm font-medium text-slate-300">Drop a CSV here or <span className="text-indigo-400 underline underline-offset-2">browse</span></p>
                    <p className="mt-1 text-xs text-slate-600">Bank statement CSV — max 10 MB</p>
                  </>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />

              {uploadError && <InfoBanner variant="danger">{uploadError}</InfoBanner>}

              {uploadedName && !uploadError && (
                <InfoBanner variant="success">
                  Uploaded: <strong className="ml-1">{uploadedName}</strong>
                </InfoBanner>
              )}
            </CardContent>
          </Card>
        )}

        {data && data.recent_reports.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Reports</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/[0.04]">
                {data.recent_reports.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <FileText className="h-4 w-4 shrink-0 text-amber-400" />
                    <span className="flex-1 text-sm font-medium text-slate-200 truncate">{r.name}</span>
                    <span className="shrink-0 text-xs text-slate-600 tabular-nums">{r.mtime}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
