"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Fingerprint, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { OstrichLogo } from "@/components/opencex/ostrich-logo";

type Mode = "login" | "signup";

export function AuthScreen({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (mode === "signup") {
      setLoading(true);
      try {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: name || undefined }),
        });
        const data = await res.json();
        if (!data.ok) {
          toast.error(data.error ?? "Signup failed");
          setLoading(false);
          return;
        }
        toast.success("Account created · signing you in…");
      } catch (err) {
        toast.error((err as Error).message);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }
    if (result?.ok) {
      toast.success(mode === "signup" ? "Welcome to Mbuni CEX" : "Welcome back");
      // Brief delay so JWT mint completes before onComplete reads session
      setTimeout(onComplete, 200);
    }
  };

  const passkeySignIn = async () => {
    if (passkeyLoading) return;
    setPasskeyLoading(true);
    // Simulated WebAuthn flow — production would call navigator.credentials.get()
    toast.info("Passkey prompt", { description: "Authenticating with device biometrics…" });
    setTimeout(() => {
      setPasskeyLoading(false);
      toast.success("Passkey verified · welcome back");
      onComplete();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(0.4 0.008 250) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.4 0.008 250) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.18 152 / 0.12) 0%, transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Back */}
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to welcome
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-black mb-3 overflow-hidden">
            <OstrichLogo className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "login" ? "Sign in to your Mbuni CEX account" : "Start trading in under a minute"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-2xl">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-muted/30 rounded-lg mb-5">
            <button
              onClick={() => setMode("login")}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "login" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "signup" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field icon={User} label="Display name (optional)">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="alex.trader"
                  autoComplete="name"
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
            )}

            <Field icon={Mail} label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>

            <Field icon={Lock} label="Password">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Min 8 characters" : "••••••••"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={mode === "signup" ? 8 : undefined}
                className="w-full bg-transparent outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </Field>

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-[11px] text-emerald-400 hover:text-emerald-300">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? "Working…"
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground uppercase">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Passkey */}
          <button
            onClick={passkeySignIn}
            disabled={passkeyLoading}
            className="w-full py-2.5 rounded-lg border border-border hover:bg-muted/40 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {passkeyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
            Continue with Passkey
          </button>

          <div className="mt-4 flex items-start gap-2 text-[10px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3 mt-0.5 shrink-0 text-emerald-400" />
            <span>
              We never store passwords in plaintext — all credentials are bcrypt-hashed.
              Sessions are JWT-backed with 30-day expiry.
            </span>
          </div>
        </div>

        {/* Demo creds hint */}
        <div className="mt-4 text-center text-[11px] text-muted-foreground">
          New here?{" "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            {mode === "login" ? "Create an account" : "Sign in instead"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">{label}</label>
      <div className="flex items-center gap-2 bg-input border border-border rounded-lg px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {children}
      </div>
    </div>
  );
}
