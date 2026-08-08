"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { useAuth } from "@/app/components/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;
    if (tab === "login") {
      result = await login(email, password);
    } else {
      if (!name.trim()) { setError("Name is required"); setLoading(false); return; }
      result = await signup(name, email, password);
    }

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2 max-[960px]:grid-cols-1">
      <aside className="bg-ink text-cream p-[50px_56px] flex flex-col justify-between relative overflow-hidden max-[960px]:hidden">
        <div className="absolute -top-[180px] -right-[120px] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(166,124,46,.18),transparent_65%)]" />
        <div className="absolute -bottom-[200px] -left-[100px] w-[420px] h-[420px] rounded-full bg-[radial-gradient(circle,rgba(67,56,202,.25),transparent_65%)]" />

        <div className="relative z-[2] flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2.5 font-serif font-semibold text-[22px] tracking-tight text-cream">
            <span className="w-[34px] h-[34px] rounded-[9px] bg-cream text-ink grid place-items-center text-[16px] font-serif font-semibold">
              <Wallet size={16} strokeWidth={2.5} />
            </span>
            SpendWise
          </Link>
          <span className="text-[11px] text-gold-soft tracking-[.12em] uppercase border border-gold-soft/30 px-3 py-[5px] rounded-full">Trusted · 50K+</span>
        </div>

        <div className="relative z-[2] max-w-[460px]">
          <div className="text-[12px] text-gold-soft tracking-[.14em] uppercase mb-4 font-semibold">— Start your journey</div>
          <h2 className="font-serif text-[44px] font-normal leading-[1.1] tracking-[-.02em] mb-6 italic text-cream">
            Let&apos;s <em className="text-gold-soft font-medium">begin</em>.
          </h2>
          <p className="text-cream-3 opacity-80 text-[15px] leading-[1.6] mb-8 max-w-[380px]">
            Track your spending, set budgets, and build habits that quietly compound — all in one calm, considered app.
          </p>
          <div className="flex items-center gap-3.5 pt-6 border-t border-white/[.12]">
            <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-gold to-gold-soft grid place-items-center text-ink font-semibold text-[14px] font-serif">S</div>
            <div>
              <div className="text-[14px] font-medium text-cream">SpendWise</div>
              <div className="text-[12.5px] text-cream-3 opacity-70 mt-0.5">Your finances, simplified</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-9 pt-8 border-t border-white/[.1]">
            {[
              { icon: "🔒", label: "256-bit encryption" },
              { icon: "🌍", label: "GDPR compliant" },
              { icon: "⚡", label: "Free forever" },
              { icon: "📥", label: "Export anytime" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2.5 text-[13px] text-cream-3 opacity-85">
                <div className="w-7 h-7 rounded-[7px] bg-gold/18 text-gold-soft grid place-items-center text-[13px] flex-shrink-0">{f.icon}</div>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-[2] text-[12px] opacity-60 flex justify-between items-center">
          <span>© 2026 SpendWise</span>
          <span>Made with care</span>
        </div>
      </aside>

      <main className="flex items-center justify-center p-[50px_32px] bg-cream relative">
        <div className="w-full max-w-[420px] relative z-[2]">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted mb-10 hover:text-ink transition-colors">
            <span className="text-muted">←</span> Back to home
          </Link>

          <div className="mb-8">
            <div className="text-[12px] font-semibold text-gold tracking-[.14em] uppercase mb-3.5">Welcome</div>
            <h2 className="font-serif text-[38px] font-normal tracking-[-.025em] leading-[1.08] mb-2.5">
              {tab === "login" ? <>Welcome <em className="italic text-indigo" style={{ fontStyle: "italic" }}>back</em>.</> : <>Begin <em className="italic text-indigo" style={{ fontStyle: "italic" }}>anew</em>.</>}
            </h2>
            <p className="text-muted text-[14.5px]">
              {tab === "login" ? "Log in to continue where you left off." : "Start tracking expenses free — no credit card needed."}
            </p>
          </div>

          <div className="flex gap-0 border-b border-line-2 mb-7">
            <button onClick={() => setTab("login")} className={`pb-3 mr-8 text-[15px] font-medium relative transition-colors font-sans ${tab === "login" ? "text-ink" : "text-muted hover:text-ink-3"}`}>
              Log in
              {tab === "login" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />}
            </button>
            <button onClick={() => setTab("signup")} className={`pb-3 text-[15px] font-medium relative transition-colors font-sans ${tab === "signup" ? "text-ink" : "text-muted hover:text-ink-3"}`}>
              Sign up
              {tab === "signup" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {tab === "signup" && (
              <div className="mb-[18px]">
                <label className="block text-[12.5px] font-medium mb-2 text-ink tracking-[.02em]">Full name</label>
                <input type="text" placeholder="Enter your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted-2 transition-colors focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
              </div>
            )}
            <div className="mb-[18px]">
              <label className="block text-[12.5px] font-medium mb-2 text-ink tracking-[.02em]">Email address</label>
                <input type="email" placeholder="Enter your email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted-2 transition-colors focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            <div className="mb-[18px]">
              <label className="block text-[12.5px] font-medium mb-2 text-ink tracking-[.02em]">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} placeholder="Enter your password" required autoComplete={tab === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted-2 transition-colors focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)] pr-16" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] text-muted font-medium cursor-pointer hover:text-ink select-none">
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-accent-red/10 text-[13px] text-accent-red font-medium">{error}</div>}

            {tab === "login" && (
              <div className="flex justify-between items-center text-[13px] mb-6">
                <label className="flex items-center gap-2 text-muted cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-auto accent-ink" /> Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-ink font-medium border-b border-ink pb-px cursor-pointer">Forgot password?</Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-[15px] rounded-lg bg-ink text-cream border border-ink text-[15px] font-medium hover:bg-ink-2 disabled:opacity-50 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(30,27,75,.4)] group">
              {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>{tab === "login" ? "Log in" : "Create account"} <span className="transition-transform group-hover:translate-x-1">→</span></>}
            </button>
          </form>

          <div className="flex items-center gap-3.5 text-muted text-[12px] my-6 tracking-[.08em] uppercase font-medium">
            <span className="flex-1 h-px bg-line-2" />
            or continue with
            <span className="flex-1 h-px bg-line-2" />
          </div>

          <button onClick={() => {
            const params = new URLSearchParams({
              client_id: "887084866610-fng800tfu6bj2uq5pibnnl6s9n8iharu.apps.googleusercontent.com",
              redirect_uri: `${window.location.origin}/api/auth/callback/google`,
              response_type: "code",
              scope: "openid email profile",
              access_type: "offline",
            });
            window.location.href = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
          }} className="w-full py-[11px] border border-line-2 rounded-lg bg-white text-[13px] font-medium flex items-center justify-center gap-[7px] hover:border-ink hover:bg-cream-2 transition-all cursor-pointer text-ink hover:-translate-y-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>

          <p className="text-center text-[13.5px] text-muted mt-7">
            {tab === "login" ? <>Don&apos;t have an account? <button onClick={() => setTab("signup")} className="text-ink font-medium cursor-pointer border-b border-ink pb-px">Sign up free</button></> : <>Already have an account? <button onClick={() => setTab("login")} className="text-ink font-medium cursor-pointer border-b border-ink pb-px">Log in</button></>}
          </p>

          <div className="flex justify-center gap-6 mt-9 pt-6 border-t border-line">
            {["Bank-grade security", "No credit card needed", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-[11.5px] text-muted tracking-[.02em]">
                <span className="text-accent-green font-bold">✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
