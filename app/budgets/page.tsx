"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { useCurrency } from "../components/CurrencyContext";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import Sidebar from "../components/Sidebar";

interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

const categories = ["Food", "Transport", "Entertainment", "Shopping", "Utilities", "Health", "Education", "Travel", "Other"];

export default function BudgetsPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState(0);
  const [newCategory, setNewCategory] = useState("Food");
  const [newLimit, setNewLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    Promise.all([
      fetch(`/api/budgets?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/expenses?userId=${user.id}`).then((r) => r.json()),
    ]).then(([budData, expData]) => {
      const budgetsList = budData.budgets || [];
      const expenses = expData.expenses || [];
      const updated = budgetsList.map((b: { category: string; month: string; limit: number; [key: string]: unknown }) => {
        const spent = expenses
          .filter((e: { type: string; category: string; date: string }) => e.type === "expense" && e.category === b.category && e.date.startsWith(b.month))
          .reduce((s: number, e: { amount: number }) => s + e.amount, 0);
        return { ...b, spent };
      });
      setBudgets(updated);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const handleAdd = async () => {
    if (!user || !newLimit) return;
    setSaving(true);
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, category: newCategory, limit: Number(newLimit), month: currentMonth }),
    });
    const res = await fetch(`/api/budgets?userId=${user.id}`);
    const d = await res.json();
    setBudgets(d.budgets || []);
    setShowAdd(false);
    setNewLimit("");
    setSaving(false);
    addToast("Budget created");
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    await fetch("/api/budgets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, limit: editLimit }),
    });
    setBudgets((prev) => prev.map((b) => b._id === id ? { ...b, limit: editLimit } : b));
    setEditId(null);
    setSaving(false);
    addToast("Budget updated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return;
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    setBudgets((prev) => prev.filter((b) => b._id !== id));
    addToast("Budget deleted");
  };

  if (loading) return <div className="flex min-h-screen bg-cream items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Budgets" />

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-8 relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-muted hover:text-ink text-[18px]">✕</button>
            <h3 className="font-serif text-[24px] font-medium mb-6" style={{ color: "#1E1B4B" }}>New budget</h3>
            <div className="mb-4">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Monthly limit ({symbol})</label>
              <input type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            <button onClick={handleAdd} disabled={!newLimit || saving} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">{saving ? "Creating..." : "Create budget"}</button>
          </div>
        </div>
      )}

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[1100px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
          <div>
            <div className="text-[13px] text-muted mb-1.5">{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
            <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]" style={{ color: "#1E1B4B" }}>Budgets</h2>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-[18px] py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">
            <Plus size={15} strokeWidth={2.5} /> New budget
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-[48px] mb-4">📊</div>
            <h3 className="font-serif text-[22px] font-medium mb-2" style={{ color: "#1E1B4B" }}>No budgets yet</h3>
            <p className="text-[14px] text-muted mb-6">Set spending limits for each category to stay on track.</p>
            <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">Create your first budget</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 max-[800px]:grid-cols-1 gap-4">
            {budgets.map((b) => {
              const pct = b.limit > 0 ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
              const remaining = b.limit - b.spent;
              return (
                <div key={b._id} className="bg-white border border-line rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-cream-2 border border-line grid place-items-center text-[18px]">
                        {b.category === "Food" ? "🛒" : b.category === "Transport" ? "⛽" : b.category === "Entertainment" ? "🎬" : b.category === "Shopping" ? "🛍️" : b.category === "Utilities" ? "💡" : b.category === "Health" ? "💊" : b.category === "Education" ? "📚" : b.category === "Travel" ? "✈️" : "📁"}
                      </div>
                      <div>
                        <h3 className="font-serif text-[18px] font-medium" style={{ color: "#1E1B4B" }}>{b.category}</h3>
                        <div className="text-[12px] text-muted">{b.month}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editId === b._id ? (
                        <>
                          <input type="number" value={editLimit} onChange={(e) => setEditLimit(Number(e.target.value))} className="w-24 px-2 py-1 border border-line-2 rounded text-[13px] text-ink" />
                          <button onClick={() => handleUpdate(b._id)} className="w-8 h-8 rounded-lg bg-accent-green/10 text-accent-green grid place-items-center"><Check size={14} /></button>
                          <button onClick={() => setEditId(null)} className="w-8 h-8 rounded-lg bg-accent-red/10 text-accent-red grid place-items-center"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditId(b._id); setEditLimit(b.limit); }} className="w-8 h-8 rounded-lg bg-cream-2 text-muted grid place-items-center hover:text-ink transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(b._id)} className="w-8 h-8 rounded-lg bg-cream-2 text-muted grid place-items-center hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-[13px] mb-2">
                    <span className="text-muted">Spent: <strong className="text-ink">{symbol}{b.spent.toLocaleString()}</strong></span>
                    <span className="text-muted">Limit: <strong className="text-ink">{symbol}{b.limit.toLocaleString()}</strong></span>
                  </div>
                  <div className="h-[6px] rounded-full bg-cream-3 overflow-hidden mb-2">
                    <div className={`h-full rounded-full transition-all duration-500 ${pct > 90 ? "bg-accent-red" : pct > 70 ? "bg-gold" : "bg-accent-green"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className={`font-medium ${pct > 90 ? "text-accent-red" : pct > 70 ? "text-gold" : "text-accent-green"}`}>{pct}% used</span>
                    <span className="text-muted">{remaining > 0 ? `${symbol}${remaining.toLocaleString()} remaining` : "Over budget!"}</span>
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
