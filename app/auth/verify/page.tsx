"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../components/AuthContext";
import { useToast } from "../../components/ToastContext";

function OTPForm() {
  const { user, verifyOTP, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user?.verified) { router.push("/dashboard"); return; }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!email || authLoading || !user) return;
    fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  }, [email, authLoading, user]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");
    if (value && index < 5) {
      const next = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
      if (next) next.focus();
    }
    if (newCode.every((c) => c.length === 1)) {
      verifyCode(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      const prev = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      if (prev) prev.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      verifyCode(pasted);
    }
  };

  const verifyCode = async (otpCode: string) => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: otpCode }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.error) {
      setError(data.error);
      setCode(["", "", "", "", "", ""]);
      const first = document.querySelector('input[data-index="0"]') as HTMLInputElement;
      if (first) first.focus();
      return;
    }

    verifyOTP();
    addToast("Email verified");
    router.push("/dashboard");
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setCooldown(60);
    setResending(false);
    addToast("New code sent");
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white border border-line rounded-2xl max-w-[440px] w-full p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-ink text-cream grid place-items-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          </div>
          <h2 className="font-serif text-[24px] font-medium mb-2" style={{ color: "#1E1B4B" }}>Verify your email</h2>
          <p className="text-[14px] text-muted">We sent a 6-digit code to<br /><strong className="text-ink">{email}</strong></p>
        </div>

        <div className="flex justify-center gap-3 mb-6">
          {code.map((digit, i) => (
            <input
              key={i}
              data-index={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e.key)}
              onPaste={handlePaste}
              disabled={loading}
              className="w-12 h-14 text-center text-[22px] font-semibold font-serif border border-line-2 rounded-xl bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)] transition-all disabled:opacity-50"
            />
          ))}
        </div>

        {error && (
          <div className="text-center text-[13px] text-accent-red mb-4">{error}</div>
        )}

        {loading && (
          <div className="text-center text-[13px] text-muted mb-4">
            <div className="h-4 w-4 rounded-full border-2 border-ink/20 border-t-ink animate-spin inline-block mr-2" />
            Verifying...
          </div>
        )}

        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-[13px] text-muted">Resend code in {cooldown}s</p>
          ) : (
            <button onClick={handleResend} disabled={resending} className="text-[13px] text-ink font-medium hover:underline">
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
      </div>
    }>
      <OTPForm />
    </Suspense>
  );
}
