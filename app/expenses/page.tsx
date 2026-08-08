"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { useCurrency } from "../components/CurrencyContext";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import Sidebar from "../components/Sidebar";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note?: string;
}

export default function ExpensesPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    fetch(`/api/expenses?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setExpenses(d.expenses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const filtered = expenses.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const refresh = async () => {
    if (!user) return;
    const res = await fetch(`/api/expenses?userId=${user.id}`);
    const d = await res.json();
    setExpenses(d.expenses || []);
  };

  const handleAdd = async (formData: FormData) => {
    if (!user) return;
    setSaving(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        title: formData.get("title"),
        amount: Number(formData.get("amount")),
        type: formData.get("type"),
        category: formData.get("category"),
        date: formData.get("date"),
        note: formData.get("note"),
      }),
    });
    await refresh();
    setShowAdd(false);
    setSaving(false);
    addToast("Transaction added");
  };

  const handleEdit = async (formData: FormData) => {
    if (!user || !editing) return;
    setSaving(true);
    await fetch("/api/expenses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing._id,
        title: formData.get("title"),
        amount: Number(formData.get("amount")),
        type: formData.get("type"),
        category: formData.get("category"),
        date: formData.get("date"),
        note: formData.get("note"),
      }),
    });
    await refresh();
    setEditing(null);
    setSaving(false);
    addToast("Transaction updated");
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this transaction?")) return;
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    addToast("Transaction deleted");
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const TransactionForm = ({ onSubmit, initial, submitLabel }: { onSubmit: (fd: FormData) => void; initial?: Expense; submitLabel: string }) => (
    <form action={onSubmit}>
      <div className="mb-4">
        <label className="block text-[12.5px] font-medium mb-2 text-ink">Title</label>
        <input name="title" required defaultValue={initial?.title} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[12.5px] font-medium mb-2 text-ink">Amount</label>
          <input name="amount" type="number" required defaultValue={initial?.amount} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
        </div>
        <div>
          <label className="block text-[12.5px] font-medium mb-2 text-ink">Type</label>
          <select name="type" defaultValue={initial?.type || "expense"} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[12.5px] font-medium mb-2 text-ink">Category</label>
          <select name="category" defaultValue={initial?.category || "Food"} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink">
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Utilities">Utilities</option>
            <option value="Health">Health</option>
            <option value="Income">Income</option>
            <option value="Investment">Investment</option>
          </select>
        </div>
        <div>
          <label className="block text-[12.5px] font-medium mb-2 text-ink">Date</label>
          <input name="date" type="date" required defaultValue={initial?.date || new Date().toISOString().split("T")[0]} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink" />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-[12.5px] font-medium mb-2 text-ink">Note (optional)</label>
        <input name="note" defaultValue={initial?.note} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
      </div>
      <button type="submit" disabled={saving} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-cream items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Transactions" />

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-8 relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-muted hover:text-ink text-[18px]">✕</button>
            <h3 className="font-serif text-[24px] font-medium mb-6">Add transaction</h3>
            <TransactionForm onSubmit={handleAdd} submitLabel="Save transaction" />
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-8 relative">
            <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-muted hover:text-ink text-[18px]">✕</button>
            <h3 className="font-serif text-[24px] font-medium mb-6">Edit transaction</h3>
            <TransactionForm onSubmit={handleEdit} initial={editing} submitLabel="Update transaction" />
          </div>
        </div>
      )}

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[1100px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
          <div>
            <div className="text-[13px] text-muted mb-1.5">{today}</div>
            <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]">Transactions</h2>
          </div>
          <div className="flex items-center gap-2.5 max-[600px]:w-full">
            <div className="flex items-center gap-2 bg-white border border-line-2 rounded-lg px-3.5 py-2.5 text-[13px] text-muted flex-1 min-w-[120px]">
              <Search size={14} />
              <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-none outline-none bg-none text-[13px] flex-1 text-ink placeholder:text-muted" />
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-[18px] py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">
              <Plus size={15} strokeWidth={2.5} /> <span className="max-[600px]:hidden">Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-semibold text-muted uppercase tracking-[.06em] border-b border-line">
                <th className="text-left px-6 py-3">Transaction</th>
                <th className="text-left px-6 py-3 max-[700px]:hidden">Category</th>
                <th className="text-left px-6 py-3 max-[700px]:hidden">Date</th>
                <th className="text-right px-6 py-3">Amount</th>
                <th className="px-6 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[14px] text-muted">
                    {search ? "No transactions match your search." : "No transactions yet. Add your first one!"}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e._id} className="border-b border-line/50 last:border-0 hover:bg-cream-2 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-[38px] h-[38px] rounded-[9px] bg-cream-2 grid place-items-center text-[16px]">
                          {e.type === "income" ? "📈" : "🛒"}
                        </div>
                        <div>
                          <div className="text-[14px] font-medium text-ink">{e.title}</div>
                          <div className="text-[12px] text-muted max-[700px]:hidden">{e.category} · {e.date}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-muted max-[700px]:hidden">{e.category}</td>
                    <td className="px-6 py-3.5 text-[13px] text-muted max-[700px]:hidden">{e.date}</td>
                    <td className={`px-6 py-3.5 text-right font-serif text-[15px] font-medium ${e.type === "income" ? "text-accent-green" : "text-accent-red"}`}>
                      {e.type === "income" ? "+" : "−"}{symbol}{e.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditing(e)} className="text-muted hover:text-ink transition-colors p-1">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(e._id)} className="text-muted hover:text-accent-red transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
