"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertCircle, Info, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

function LoginForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const { login, token, ready } = useAuth();

  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("demo123");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const sessionMsg = params.get("msg") ? decodeURIComponent(params.get("msg")!) : null;

  useEffect(() => {
    if (ready && token) router.replace(params.get("from") ?? "/dashboard/overview");
  }, [ready, token, router, params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      router.replace(params.get("from") ?? "/dashboard/overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
        className="mb-10 text-center"
      >
        <div className="relative mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center">
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-70 animate-pulse-glow" />
          <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl">
            <Zap className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">AI Employee</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to your operations hub</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-xl"
      >
        {/* Top shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Demo credentials banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-5 flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 cursor-pointer"
          onClick={() => { setUsername("demo"); setPassword("demo123"); }}
          title="Click to auto-fill"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-indigo-300">Demo Access — click to auto-fill</p>
            <p className="text-[11px] text-indigo-400/70 mt-0.5">
              Username: <span className="font-mono text-indigo-300">demo</span>
              {" · "}Password: <span className="font-mono text-indigo-300">demo123</span>
            </p>
          </div>
        </motion.div>

        {/* Session msg */}
        <AnimatePresence>
          {sessionMsg && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3"
            >
              <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span className="text-sm text-amber-300">{sessionMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20"
              placeholder="admin"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 pr-11 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-indigo-500/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(99,102,241,0.55)" }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {/* Shine sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />

            {loading ? (
              <span className="relative flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing in…
              </span>
            ) : (
              <span className="relative flex items-center justify-center gap-2">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center text-[11px] text-slate-700"
      >
        AI Employee Operations Dashboard · Secure Access
      </motion.p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 40%, #000000 100%)" }}>

      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full opacity-[0.07] pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: "radial-gradient(circle, #A855F7, transparent 70%)" }} />
      <div className="absolute top-1/3 -left-20 h-[400px] w-[400px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }} />

      {/* Grid */}
      <div className="absolute inset-0 bg-grid opacity-100 pointer-events-none" />

      <Suspense fallback={<div className="text-sm text-slate-600">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
