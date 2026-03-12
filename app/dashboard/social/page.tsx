"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-action";
import { usePoll } from "@/hooks/use-poll";
import { WARN } from "@/lib/warnings";
import { useDryRun } from "@/context/dry-run-context";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { useAuth } from "@/context/auth-context";
import { timeAgo, truncate } from "@/lib/utils";
import { Share2, Linkedin, Twitter, Facebook, Clock } from "lucide-react";

interface PlatformCardProps {
  name:        string;
  icon:        React.ElementType;
  iconColor:   string;
  maxLen:      number;
  content:     string;
  onChange:    (v: string) => void;
  onTest:      () => void;
  onPost:      () => void;
  testLoading: boolean;
  postLoading: boolean;
  canPost:     boolean;
  lastPost?:   string;
}

function PlatformCard({
  name, icon: Icon, iconColor, maxLen, content, onChange,
  onTest, onPost, testLoading, postLoading, canPost, lastPost,
}: PlatformCardProps) {
  const over    = content.length > maxLen;
  const nearMax = content.length > maxLen * 0.9;
  const charCls = over ? "text-red-400 font-bold" : nearMax ? "text-amber-400" : "text-slate-600";
  const pct     = Math.min((content.length / maxLen) * 100, 100);

  return (
    <Card glow className="space-y-0">
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconColor}`}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <CardTitle>{name}</CardTitle>
          {lastPost && (
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <Clock className="h-3 w-3" /> {timeAgo(lastPost)}
            </div>
          )}
        </div>
        <Badge variant="info" className="text-[10px]">
          {maxLen.toLocaleString()} chars
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={name === "Twitter / X" ? 3 : 4}
          maxLength={maxLen + 100}
          placeholder={`Write your ${name} post…`}
          value={content}
          onChange={e => onChange(e.target.value)}
        />

        {/* Char progress */}
        <div className="space-y-1.5">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${pct}%`,
                background: over ? "#ef4444" : nearMax ? "#f59e0b" : "linear-gradient(90deg,#6366f1,#a855f7)",
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-xs tabular-nums ${charCls}`}>
              {content.length.toLocaleString()} / {maxLen.toLocaleString()}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary" size="sm"
                loading={testLoading}
                disabled={!content.trim() || over}
                onClick={onTest}
                className="gap-1.5"
              >
                Test
              </Button>
              <Button
                variant={canPost ? "gradient" : "ghost"} size="sm"
                loading={postLoading}
                disabled={!content.trim() || over || !canPost}
                onClick={onPost}
                title={!canPost ? "Admin required, or exit Demo / Dry Run mode" : undefined}
                className="gap-1.5"
              >
                Post Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SocialPage() {
  const { isAdmin }           = useAuth();
  const { isSafe, demoMode }  = useDryRun();

  const dryParam    = isSafe;
  const canRealPost = isAdmin;

  const [li, setLi] = useState("");
  const [tw, setTw] = useState("");
  const [fb, setFb] = useState("");

  const history = usePoll({ fetcher: api.socialHistory, interval: 60_000 });

  const lastByPlatform = (history.data?.history ?? []).reduce<Record<string, string>>(
    (acc, ev) => {
      const p = ev.msg.match(/\b(linkedin|twitter|facebook)\b/i)?.[1]?.toLowerCase();
      if (p && !acc[p]) acc[p] = ev.ts;
      return acc;
    }, {},
  );

  const liTest = useAction(() => api.postLinkedIn(li, true),  { successMsg: "LinkedIn test simulated (dry run)" });
  const liPost = useAction(() => api.postLinkedIn(li, dryParam), {
    successMsg: dryParam ? "LinkedIn post simulated (safe mode)" : "Posted to LinkedIn",
    confirm:    dryParam ? { title: "Simulate LinkedIn post?", body: truncate(li, 120), severity: "warning" } : WARN.linkedInPost(li),
  });

  const twTest = useAction(() => api.postTwitter(tw, true),   { successMsg: "Tweet simulated (dry run)" });
  const twPost = useAction(() => api.postTwitter(tw, dryParam), {
    successMsg: dryParam ? "Tweet simulated (safe mode)" : "Tweet posted",
    confirm:    dryParam ? { title: "Simulate tweet?", body: truncate(tw, 120), severity: "warning" } : WARN.twitterPost(tw),
  });

  const fbTest = useAction(() => api.postFacebook(fb, true),  { successMsg: "Facebook test simulated (dry run)" });
  const fbPost = useAction(() => api.postFacebook(fb, dryParam), {
    successMsg: dryParam ? "Facebook post simulated (safe mode)" : "Posted to Facebook",
    confirm:    dryParam ? { title: "Simulate Facebook post?", body: truncate(fb, 120), severity: "warning" } : WARN.facebookPost(fb),
  });

  const platforms: PlatformCardProps[] = [
    {
      name: "LinkedIn", icon: Linkedin,
      iconColor: "bg-blue-700/20 border border-blue-700/30 text-blue-400",
      maxLen: 3000, content: li, onChange: setLi,
      onTest: () => liTest.run(), onPost: () => liPost.run(),
      testLoading: liTest.loading, postLoading: liPost.loading,
      canPost: canRealPost, lastPost: lastByPlatform["linkedin"],
    },
    {
      name: "Twitter / X", icon: Twitter,
      iconColor: "bg-sky-500/10 border border-sky-500/20 text-sky-400",
      maxLen: 280, content: tw, onChange: setTw,
      onTest: () => twTest.run(), onPost: () => twPost.run(),
      testLoading: twTest.loading, postLoading: twPost.loading,
      canPost: canRealPost, lastPost: lastByPlatform["twitter"],
    },
    {
      name: "Facebook", icon: Facebook,
      iconColor: "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400",
      maxLen: 63206, content: fb, onChange: setFb,
      onTest: () => fbTest.run(), onPost: () => fbPost.run(),
      testLoading: fbTest.loading, postLoading: fbPost.loading,
      canPost: canRealPost, lastPost: lastByPlatform["facebook"],
    },
  ];

  return (
    <div className="flex flex-col">
      <Topbar />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-2xl">

        <PageHeader
          icon={Share2}
          title="Social Media"
          accent="purple"
          description="Publish to LinkedIn, Twitter/X, and Facebook"
        >
          {isSafe && <Badge variant="info">{demoMode ? "Demo" : "Dry Run"}</Badge>}
          {!isSafe && isAdmin && <Badge variant="danger" dot>LIVE</Badge>}
        </PageHeader>

        {isSafe ? (
          <InfoBanner variant="info">
            <strong>{demoMode ? "Demo Mode" : "Dry Run"}</strong> — "Post Now" simulates without publishing.
            {!demoMode && isAdmin && " Disable Dry Run via the banner above to go live."}
          </InfoBanner>
        ) : !isAdmin && (
          <InfoBanner variant="warning">
            Real posts require <strong>admin access</strong>. Use <strong>Test</strong> to preview without publishing.
          </InfoBanner>
        )}

        {platforms.map(p => <PlatformCard key={p.name} {...p} />)}

        {/* History */}
        {(history.data?.history?.length ?? 0) > 0 && (
          <Card>
            <CardHeader><CardTitle>Post History</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/[0.04]">
                {history.data!.history.slice(0, 10).map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-16 shrink-0 text-[11px] text-slate-600 tabular-nums">{timeAgo(ev.ts)}</span>
                    <span className="text-xs text-slate-300 truncate">{ev.msg}</span>
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
