"use client";

import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-action";
import { usePoll } from "@/hooks/use-poll";
import { WARN } from "@/lib/warnings";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { useAuth } from "@/context/auth-context";
import { FileBarChart, FileText, Volume2, Download, Loader2, Sparkles } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024)      return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

export default function BriefingPage() {
  const { isAdmin } = useAuth();

  const files = usePoll({ fetcher: api.briefingFiles, interval: 30_000 });

  const generate = useAction(
    api.briefingGenerate,
    {
      successMsg: "CEO briefing generated — see file list below",
      errorMsg:   "Briefing generation failed — check service logs",
      confirm: WARN.briefingGenerate(),
      onSuccess: () => setTimeout(() => files.refresh(), 2_000),
    },
  );

  const voice = useAction(
    api.briefingVoice,
    {
      successMsg: "Voice briefing MP3 generated",
      errorMsg:   "Voice generation failed",
      confirm: WARN.briefingVoice(),
      onSuccess: () => setTimeout(() => files.refresh(), 2_000),
    },
  );

  const mdFiles  = (files.data?.files ?? []).filter(f => f.type === "md");
  const mp3Files = (files.data?.files ?? []).filter(f => f.type === "mp3");

  const downloadBtn = (name: string) => (
    <a
      href={api.briefingDownloadUrl(name)}
      download
      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:border-white/15 transition-all"
    >
      <Download className="h-3 w-3" />
      Download
    </a>
  );

  return (
    <div className="flex flex-col">
      <Topbar onRefresh={files.refresh} refreshing={files.loading} lastRefresh={files.lastFetch} />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-3xl">

        <PageHeader
          icon={FileBarChart}
          title="CEO Briefing"
          accent="violet"
          description="Auto-generate weekly executive summaries with AI and voice synthesis"
        >
          {!isAdmin && <Badge variant="warning">Admin required</Badge>}
        </PageHeader>

        {/* Generator card */}
        <Card glow>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <CardTitle>Generate Briefing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="gradient"
                loading={generate.loading}
                disabled={!isAdmin}
                title={!isAdmin ? "Admin required" : undefined}
                onClick={() => generate.run()}
                className="gap-2"
              >
                {generate.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {generate.loading ? "Generating… (up to 2 min)" : "Generate Briefing"}
              </Button>

              <Button
                variant="secondary"
                loading={voice.loading}
                disabled={!isAdmin}
                title={!isAdmin ? "Admin required" : undefined}
                onClick={() => voice.run()}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                {voice.loading ? "Converting…" : "Generate Voice MP3"}
              </Button>
            </div>

            {!isAdmin && (
              <InfoBanner variant="warning" className="mt-4">
                Admin access is required to generate CEO briefings.
              </InfoBanner>
            )}
          </CardContent>
        </Card>

        {/* MD briefings */}
        <Card glow>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <CardTitle>Briefing Documents</CardTitle>
              {mdFiles.length > 0 && <Badge variant="default">{mdFiles.length}</Badge>}
            </div>
            {files.loading && !files.data && <Spinner size="sm" className="text-slate-500" />}
          </CardHeader>
          <CardContent className="p-0">
            {files.error && <InfoBanner variant="danger" className="m-5">{files.error}</InfoBanner>}
            {!files.error && mdFiles.length === 0 && !files.loading && (
              <div className="empty-state">
                <FileText className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm text-slate-600">No briefing files yet</p>
                <p className="text-xs text-slate-700 mt-1">Click Generate above to create one</p>
              </div>
            )}
            {mdFiles.length > 0 && (
              <div className="divide-y divide-white/[0.04]">
                {mdFiles.map(f => (
                  <div key={f.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{f.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {formatBytes(f.size)}
                        {f.mtime && ` · ${new Date(f.mtime).toLocaleDateString()}`}
                      </p>
                    </div>
                    {downloadBtn(f.name)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voice briefings */}
        {mp3Files.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <CardTitle>Voice Briefings</CardTitle>
                <Badge variant="default">{mp3Files.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/[0.04]">
                {mp3Files.map(f => (
                  <div key={f.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <Volume2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{f.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {formatBytes(f.size)}
                        {f.mtime && ` · ${new Date(f.mtime).toLocaleDateString()}`}
                      </p>
                    </div>
                    {downloadBtn(f.name)}
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
