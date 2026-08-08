"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useCurrency } from "../components/CurrencyContext";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import Sidebar from "../components/Sidebar";

interface Goal {
  _id: string;
  name: string;
  icon: string;
  target: number;
  saved: number;
  deadline: string;
}

const icons = ["🎯", "✈️", "💻", "🏠", "🚗", "📱", "🎓", "🛟", "💎", "🎮"];

export default function GoalsPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSaved, setEditSaved] = useState(0);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🎯");
  const [newTarget, setNewTarget] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    fetch(`/api/goals?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setGoals(d.goals || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const handleAdd = async () => {
    if (!user || !newName || !newTarget || !newDeadline) return;
    setSaving(true);
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, name: newName, icon: newIcon, target: Number(newTarget), saved: 0, deadline: newDeadline }),
    });
    const res = await fetch(`/api/goals?userId=${user.id}`);
    const d = await res.json();
    setGoals(d.goals || []);
    setShowAdd(false);
    setNewName("");
    setNewTarget("");
    setNewDeadline("");
    setSaving(false);
    addToast("Goal created");
  };

  const handleUpdateSaved = async (id: string) => {
    setSaving(true);
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, saved: editSaved }),
    });
    setGoals((prev) => prev.map((g) => g._id === id ? { ...g, saved: editSaved } : g));
    setEditId(null);
    setSaving(false);
    addToast("Goal updated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g._id !== id));
    addToast("Goal deleted");
  };

  if (loading) return <div className="flex min-h-screen bg-cream items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Goals" />

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-8 relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-muted hover:text-ink text-[18px]">✕</button>
            <h3 className="font-serif text-[24px] font-medium mb-6" text-ink>New goal</h3>
            <div className="mb-4">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {icons.map((icon) => (
                  <button key={icon} onClick={() => setNewIcon(icon)} className={`w-10 h-10 rounded-lg border grid place-items-center text-[18px] transition-colors ${newIcon === icon ? "border-ink bg-cream-2" : "border-line-2 hover:border-ink"}`}>{icon}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Goal name</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="e.g. Tokyo Trip" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[12.5px] font-medium mb-2 text-ink">Target ({symbol})</label>
                <input type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink" />
              </div>
              <div>
                <label className="block text-[12.5px] font-medium mb-2 text-ink">Deadline</label>
                <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink" />
              </div>
            </div>
            <button onClick={handleAdd} disabled={!newName || !newTarget || !newDeadline || saving} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">{saving ? "Creating..." : "Create goal"}</button>
          </div>
        </div>
      )}

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[1100px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
          <div>
            <div className="text-[13px] text-muted mb-1.5">Savings targets</div>
            <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]" text-ink>Goals</h2>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-[18px] py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">
            <Plus size={15} strokeWidth={2.5} /> New goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[48px] mb-4">🎯</div>
            <h3 className="font-serif text-[22px] font-medium mb-2" text-ink>No goals yet</h3>
            <p className="text-[14px] text-muted mb-6">Set a savings goal and track your progress.</p>
            <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">Create your first goal</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 max-[800px]:grid-cols-1 gap-4">
            {goals.map((g) => {
              const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
              const remaining = g.target - g.saved;
              return (
                <div key={g._id} className="bg-white border border-line rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-[10px] bg-cream-2 border border-line grid place-items-center text-[20px]">{g.icon}</div>
                      <div>
                        <h3 className="font-serif text-[18px] font-medium" text-ink>{g.name}</h3>
                        <div className="text-[12px] text-muted">Deadline: {g.deadline}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editId === g._id ? (
                        <>
                          <input type="number" value={editSaved} onChange={(e) => setEditSaved(Number(e.target.value))} className="w-24 px-2 py-1 border border-line-2 rounded text-[13px] text-ink" />
                          <button onClick={() => handleUpdateSaved(g._id)} className="w-8 h-8 rounded-lg bg-accent-green/10 text-accent-green grid place-items-center"><Check size={14} /></button>
                          <button onClick={() => setEditId(null)} className="w-8 h-8 rounded-lg bg-accent-red/10 text-accent-red grid place-items-center"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(g._id); setEditSaved(g.saved); }} className="w-8 h-8 rounded-lg bg-cream-2 text-muted grid place-items-center hover:text-ink transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(g._id)} className="w-8 h-8 rounded-lg bg-cream-2 text-muted grid place-items-center hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-[13px] mb-2">
                    <span className="text-muted">Saved: <strong className="text-ink">{symbol}{g.saved.toLocaleString()}</strong></span>
                    <span className="text-muted">Target: <strong className="text-ink">{symbol}{g.target.toLocaleString()}</strong></span>
                  </div>
                  <div className="h-[6px] rounded-full bg-cream-3 overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-accent-green transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-accent-green">{pct}% complete</span>
                    <span className="text-muted">{symbol}{remaining.toLocaleString()} to go</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
