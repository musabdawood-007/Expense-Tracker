"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../components/AuthContext";
import Sidebar from "../components/Sidebar";
import { useCurrency, currencies, Currency } from "../components/CurrencyContext";

export default function SettingsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
  }, [user, router, authLoading]);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, name: name.trim() }),
    });
    const data = await res.json();
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirm("Are you sure? This will permanently delete your account and ALL data.")) return;
    await fetch(`/api/user?id=${user.id}`, { method: "DELETE" });
    logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Settings" />

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[800px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="mb-8">
          <div className="text-[13px] text-muted mb-1.5">Account preferences</div>
          <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]" text-ink>Settings</h2>
        </div>

        {/* Profile */}
        <div className="bg-white border border-line rounded-xl p-6 mb-4">
          <h3 className="font-serif text-[18px] font-medium mb-5" text-ink>Profile</h3>
          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-4 mb-4">
            <div>
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Email</label>
              <input value={email} disabled className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-cream-2 text-muted cursor-not-allowed" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || !name.trim()} className="px-5 py-2.5 rounded-lg bg-ink text-cream text-[13px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save changes"}
          </button>
        </div>

        {/* Currency */}
        <div className="bg-white border border-line rounded-xl p-6 mb-4">
          <h3 className="font-serif text-[18px] font-medium mb-5" text-ink>Currency</h3>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(currencies) as Currency[]).map((c) => (
              <button key={c} onClick={() => setCurrency(c)} className={`px-4 py-2.5 rounded-lg border text-[13px] font-medium transition-all ${c === currency ? "bg-ink text-cream border-ink" : "bg-white text-muted border-line-2 hover:border-ink"}`}>
                {currencies[c].label}
              </button>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-accent-red/30 rounded-xl p-6">
          <h3 className="font-serif text-[18px] font-medium mb-2 text-accent-red" text-ink>Danger zone</h3>
          <p className="text-[13px] text-muted mb-4">Permanently delete your account and all data (expenses, budgets, goals, groups, rooms).</p>
          <button onClick={handleDeleteAccount} className="px-5 py-2.5 rounded-lg bg-accent-red/10 text-accent-red text-[13px] font-medium hover:bg-accent-red/20 transition-all">
            Delete account
          </button>
        </div>
      </main>
    </div>
  );
}
