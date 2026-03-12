"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAction } from "@/hooks/use-action";
import { WARN } from "@/lib/warnings";
import { useDryRun } from "@/context/dry-run-context";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { InfoBanner } from "@/components/ui/info-banner";
import { useAuth } from "@/context/auth-context";
import { Mail, Send, FlaskConical } from "lucide-react";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="form-label">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-600 text-right">{hint}</p>}
    </div>
  );
}

export default function EmailPage() {
  const { isAdmin }          = useAuth();
  const { isSafe, demoMode } = useDryRun();

  const [to,      setTo]      = useState("");
  const [subject, setSubject] = useState("");
  const [body,    setBody]    = useState("");

  const testEmail = useAction(
    () => api.emailTest(to, subject, body),
    { successMsg: "Test email queued (dry run — nothing sent)" },
  );

  const sendEmail = useAction(
    () => api.emailSend(to, subject, body),
    {
      successMsg: isSafe
        ? "Email simulated (backend is in safe mode)"
        : res => res.ok ? "Email sent successfully" : "Send queued",
      confirm: isSafe
        ? { title: "Simulate email send?", body: `Backend is in ${demoMode ? "Demo" : "Dry Run"} mode — no real email will be sent.`, severity: "warning", confirmText: "Simulate" }
        : WARN.emailSend(to),
    },
  );

  const isValid = to.trim() && subject.trim() && body.trim();

  return (
    <div className="flex flex-col">
      <Topbar />

      <main className="flex-1 p-4 sm:p-6 space-y-5 animate-fade-up max-w-2xl">

        <PageHeader
          icon={Mail}
          title="Email System"
          accent="indigo"
          description="Compose and send emails through the Gmail automation pipeline"
        >
          {isSafe && <Badge variant="info">{demoMode ? "Demo" : "Dry Run"}</Badge>}
          {!isSafe && isAdmin && <Badge variant="danger" dot>LIVE</Badge>}
          {!isAdmin && <Badge variant="default">View Only</Badge>}
        </PageHeader>

        {isSafe && (
          <InfoBanner variant="info" icon={FlaskConical}>
            <strong>{demoMode ? "Demo Mode" : "Dry Run"}</strong> — "Send Real Email" will simulate without delivering.
            {!demoMode && isAdmin && " Disable Dry Run via the banner above to go live."}
          </InfoBanner>
        )}

        <Card glow>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <CardTitle>Compose Email</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field label="To">
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={e => setTo(e.target.value)}
              />
            </Field>

            <Field label="Subject" hint={`${subject.length}/200`}>
              <Input
                type="text"
                placeholder="Subject line"
                maxLength={200}
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </Field>

            <Field label="Body">
              <Textarea
                rows={6}
                placeholder="Email body…"
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </Field>

            <div className="flex items-center gap-3 pt-1 border-t border-white/[0.06]">
              <Button
                variant="secondary"
                size="md"
                loading={testEmail.loading}
                disabled={!isValid}
                onClick={() => testEmail.run()}
                className="gap-2"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Test (Dry Run)
              </Button>

              <Button
                variant={isAdmin && !isSafe ? "danger" : "outline"}
                size="md"
                loading={sendEmail.loading}
                disabled={!isValid || !isAdmin}
                title={!isAdmin ? "Admin access required" : undefined}
                onClick={() => sendEmail.run()}
                className="gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                {isSafe ? "Send (Simulated)" : "Send Real Email"}
              </Button>

              {!isAdmin && (
                <p className="text-xs text-slate-600 ml-auto">Admin access required to send</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
