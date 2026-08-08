"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../components/ToastContext";

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<"email" | "otp" | "new-password">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSendOTP = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    setStep("otp");
    setCooldown(60);
    addToast("Reset code sent to your email");
  };

  const handleCodeChange = async (index: number, value: string) => {
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
      setLoading(true);
      setError("");
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: newCode.join("") }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.error) { setError(data.error); return; }
      setStep("new-password");
    }
  };

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 3) { setError("Password must be at least 3 characters"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: code.join(""), newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    addToast("Password reset successfully");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="bg-white border border-line rounded-2xl max-w-[440px] w-full p-8">
        <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-[13px] text-muted mb-6 hover:text-ink transition-colors">
          ← Back to login
        </Link>

        {step === "email" && (
          <>
            <h2 className="font-serif text-[24px] font-medium mb-2 text-ink" style={{ color: "#1E1B4B" }}>Forgot password?</h2>
            <p className="text-[14px] text-muted mb-6">Enter your email and we&apos;ll send you a reset code.</p>
            <div className="mb-4">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted-2 focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            {error && <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-accent-red/10 text-[13px] text-accent-red font-medium">{error}</div>}
            <button onClick={handleSendOTP} disabled={!email || loading} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">
              {loading ? "Sending..." : "Send reset code"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="font-serif text-[24px] font-medium mb-2 text-ink" style={{ color: "#1E1B4B" }}>Check your email</h2>
            <p className="text-[14px] text-muted mb-6">We sent a 6-digit code to <strong className="text-ink">{email}</strong></p>
            <div className="flex justify-center gap-3 mb-6">
              {code.map((digit, i) => (
                <input key={i} data-index={i} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleCodeChange(i, e.target.value)} className="w-12 h-14 text-center text-[22px] font-semibold font-serif border border-line-2 rounded-xl bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)] transition-all" />
              ))}
            </div>
            {error && <div className="text-center text-[13px] text-accent-red mb-4">{error}</div>}
            <div className="text-center">
              {cooldown > 0 ? (
                <p className="text-[13px] text-muted">Resend in {cooldown}s</p>
              ) : (
                <button onClick={handleSendOTP} className="text-[13px] text-ink font-medium hover:underline">Resend code</button>
              )}
            </div>
          </>
        )}

        {step === "new-password" && (
          <>
            <h2 className="font-serif text-[24px] font-medium mb-2 text-ink" style={{ color: "#1E1B4B" }}>Set new password</h2>
            <p className="text-[14px] text-muted mb-6">Enter a new password for <strong className="text-ink">{email}</strong></p>
            <div className="mb-4">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted-2 focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            {error && <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-accent-red/10 text-[13px] text-accent-red font-medium">{error}</div>}
            <button onClick={handleReset} disabled={!newPassword || loading} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
