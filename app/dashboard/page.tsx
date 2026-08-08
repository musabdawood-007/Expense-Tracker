"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useCurrency, currencies, Currency } from "../components/CurrencyContext";
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
}

interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
}

function CurrencyDropdown() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line-2 bg-white text-[13px] font-medium text-ink hover:border-ink transition-colors">
        {currency} <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 bg-white border border-line-2 rounded-lg shadow-lg py-1.5 z-50 min-w-[160px]">
          {(Object.keys(currencies) as Currency[]).map((c) => (
            <button key={c} onClick={() => { setCurrency(c); setOpen(false); }} className={`w-full text-left px-3.5 py-2 text-[13px] hover:bg-cream-2 transition-colors ${c === currency ? "font-semibold text-ink bg-cream-2" : "text-muted"}`}>
              {currencies[c].label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CashflowTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  const { symbol } = useCurrency();
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-line p-3">
      <p className="text-[12px] font-semibold text-ink mb-1">Day {label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[11px]" style={{ color: p.name === "income" ? "#2F6F4E" : "#A23B3B" }}>
          {p.name === "income" ? "Income" : "Expenses"}: {symbol}{p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function Sparkline({ heights, dark }: { heights: number[]; dark?: boolean }) {
  return (
    <div className="absolute bottom-3.5 right-3.5 flex items-end gap-[3px] h-[30px] opacity-70">
      {heights.map((h, i) => (
        <div key={i} className={`w-1 rounded-t-sm ${dark ? "bg-gold-soft opacity-50" : "bg-ink opacity-30"}`} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [chip, setChip] = useState("30D");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [realBudgets, setRealBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    Promise.all([
      fetch(`/api/expenses?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/budgets?userId=${user.id}`).then((r) => r.json()),
    ]).then(([expData, budData]) => {
      setExpenses(expData.expenses || []);
      setRealBudgets(budData.budgets || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const filtered = expenses.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
  });

  const totalIncome = expenses.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const categoryMap: Record<string, number> = {};
  expenses.filter((e) => e.type === "expense").forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const categoryColors = ["#A67C2E", "#4338CA", "#D4B876", "#A23B3B", "#2D2A6E", "#2F6F4E"];
  const categoryData = Object.entries(categoryMap)
    .map(([name, value], i) => ({ name, value, color: categoryColors[i % categoryColors.length] }))
    .sort((a, b) => b.value - a.value);

  const cashflowData = expenses.reduce((acc: { day: string; income: number; expense: number }[], e) => {
    const day = e.date.split("-")[2];
    const existing = acc.find((a) => a.day === day);
    if (existing) {
      if (e.type === "income") existing.income += e.amount;
      else existing.expense += e.amount;
    } else {
      acc.push({ day, income: e.type === "income" ? e.amount : 0, expense: e.type === "expense" ? e.amount : 0 });
    }
    return acc;
  }, []).sort((a, b) => a.day.localeCompare(b.day));

  const categoryTotals: Record<string, number> = {};
  expenses.filter((e) => e.type === "expense").forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const budgets = realBudgets.length > 0
    ? realBudgets.map((b) => ({
        cat: b.category,
        spent: b.spent,
        limit: b.limit,
        pct: b.limit > 0 ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0,
      }))
    : Object.entries(categoryTotals)
        .map(([cat, spent]) => ({ cat, spent, limit: Math.ceil(spent * 1.3), pct: Math.min(100, Math.round((spent / (spent * 1.3)) * 100)) }))
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

  const handleAddExpense = async (formData: FormData) => {
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
    const res = await fetch(`/api/expenses?userId=${user.id}`);
    const d = await res.json();
    setExpenses(d.expenses || []);
    setShowAddExpense(false);
    setSaving(false);
    addToast("Expense added");
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user || !confirm("Delete this transaction?")) return;
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    addToast("Transaction deleted");
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="flex min-h-screen bg-cream items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Dashboard" />

      {showAddExpense && (
        <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-8 relative">
            <button onClick={() => setShowAddExpense(false)} className="absolute top-4 right-4 text-muted hover:text-ink text-[18px]">✕</button>
            <h3 className="font-serif text-[24px] font-medium mb-6">Add expense</h3>
            <form action={handleAddExpense}>
              <div className="mb-4">
                <label className="block text-[12.5px] font-medium mb-2 text-ink">Title</label>
                <input name="title" required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[12.5px] font-medium mb-2 text-ink">Amount</label>
                  <input name="amount" type="number" required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium mb-2 text-ink">Type</label>
                  <select name="type" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[12.5px] font-medium mb-2 text-ink">Category</label>
                  <select name="category" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink">
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
                  <input name="date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-[12.5px] font-medium mb-2 text-ink">Note (optional)</label>
                <input name="note" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Save expense"}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 p-[32px_40px_60px] pb-28 max-w-[1180px] w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
          <div>
            <div className="text-[13px] text-muted mb-1.5 tracking-[.02em]">{today}</div>
            <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]">Good morning, <em className="italic text-indigo" style={{ fontStyle: "italic" }}>{user?.name || "Ali"}</em>.</h2>
          </div>
          <div className="flex items-center gap-2.5 max-[600px]:flex-wrap max-[600px]:w-full">
            <div className="flex items-center gap-2 bg-white border border-line-2 rounded-lg px-3.5 py-[9px] text-[13px] text-muted flex-1 min-w-[140px] transition-all focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(30,27,75,.06)]">
              <Search size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." className="border-none outline-none bg-none text-[13px] flex-1 text-ink placeholder:text-muted font-sans" />
            </div>
            <button onClick={() => setShowAddExpense(true)} className="flex items-center gap-2 px-[18px] py-[11px] rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(30,27,75,.4)]">
              <Plus size={15} strokeWidth={2.5} /> <span className="max-[600px]:hidden">Add expense</span>
            </button>
            <CurrencyDropdown />
          </div>
        </div>

        <div className="grid grid-cols-2 max-[500px]:grid-cols-1 gap-4 mb-6">
          {[
            { lbl: "Total Balance", val: `${symbol}${(totalIncome - totalExpenses).toLocaleString()}`, delta: `${totalIncome > 0 ? "▲" : "—"} Savings`, up: totalIncome - totalExpenses > 0, dark: true, spark: [30, 50, 40, 70, 60, 90] },
            { lbl: "Income", val: `${symbol}${totalIncome.toLocaleString()}`, delta: `${expenses.filter((e) => e.type === "income").length} sources`, up: true, dark: false, spark: [60, 40, 80, 50, 90, 70] },
            { lbl: "Expenses", val: `${symbol}${totalExpenses.toLocaleString()}`, delta: `${expenses.filter((e) => e.type === "expense").length} transactions`, up: false, dark: false, spark: [80, 60, 50, 70, 40, 30] },
            { lbl: "Savings rate", val: `${savingsRate}%`, delta: `${savingsRate > 50 ? "Great" : "Room to improve"}`, up: savingsRate > 50, dark: false, spark: [50, 60, 55, 70, 80, 95] },
          ].map((s) => (
            <div key={s.lbl} className={`rounded-xl p-[22px] transition-all hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden ${s.dark ? "bg-ink border border-ink" : "bg-white border border-line"}`}>
              <div className={`text-[11.5px] uppercase tracking-[.08em] mb-2.5 font-medium ${s.dark ? "text-cream opacity-70" : "text-muted"}`}>{s.lbl}</div>
              <div className={`font-serif text-[30px] font-medium tracking-[-.02em] mb-1.5 leading-none ${s.dark ? "text-cream" : "text-ink"}`}>{s.val}</div>
              <div className={`text-[12px] font-medium ${s.up ? (s.dark ? "text-gold-soft" : "text-accent-green") : "text-accent-red"}`}>{s.delta}</div>
              <Sparkline heights={s.spark} dark={s.dark} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 max-[1000px]:grid-cols-1 gap-4 mb-4">
          <div className="bg-white border border-line rounded-xl p-6">
            <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
              <div>
                <h3 className="font-serif text-[18px] font-medium tracking-[-.015em]">Cash flow</h3>
                <div className="text-[12px] text-muted mt-0.5">Income vs expenses</div>
              </div>
              <div className="flex gap-1">
                {["7D", "30D", "90D", "1Y"].map((c) => (
                  <button key={c} onClick={() => setChip(c)} className={`text-[11.5px] font-medium px-[11px] py-[5px] rounded-full transition-colors border border-transparent ${chip === c ? "bg-ink text-cream" : "bg-cream-2 text-muted hover:border-line-2"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={cashflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7DA" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#8B87A8", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8B87A8", fontFamily: "Inter" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${symbol}${v / 1000}k`} />
                <Tooltip content={<CashflowTooltip />} />
                <Line type="monotone" dataKey="income" stroke="#2F6F4E" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#2F6F4E" }} />
                <Line type="monotone" dataKey="expense" stroke="#A23B3B" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#A23B3B" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 max-[1000px]:grid-cols-1 gap-4 mb-4">
          <div className="bg-white border border-line rounded-xl p-6">
            <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
              <div>
                <h3 className="font-serif text-[18px] font-medium tracking-[-.015em]">Recent transactions</h3>
                <div className="text-[12px] text-muted mt-0.5">{filtered.length} total</div>
              </div>
              <Link href="/expenses" className="text-[11.5px] font-medium px-[11px] py-[5px] rounded-full bg-cream-2 text-muted cursor-pointer hover:border-line-2 transition-colors">View all →</Link>
            </div>
            <div className="flex flex-col gap-px">
              {filtered.slice(0, 7).map((t) => (
                <div key={t._id} className="flex items-center gap-3.5 py-3 border-b border-line last:border-0 hover:bg-cream-2 transition-colors px-2 rounded-lg">
                  <div className="w-[38px] h-[38px] rounded-[9px] bg-cream-2 grid place-items-center text-[16px] flex-shrink-0">
                    {t.type === "income" ? "📈" : "🛒"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-ink">{t.title}</div>
                    <div className="text-[12px] text-muted mt-0.5">{t.category} · {t.date}</div>
                  </div>
                  <button onClick={() => handleDeleteExpense(t._id)} className={`font-serif text-[15px] font-medium tracking-[-.01em] ${t.type === "income" ? "text-accent-green" : "text-accent-red"}`}>
                    {t.type === "income" ? "+" : "−"}{symbol}{t.amount.toLocaleString()}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-line rounded-xl p-6">
            <div className="flex justify-between items-center mb-5 gap-3 flex-wrap">
              <div>
                <h3 className="font-serif text-[18px] font-medium tracking-[-.015em]">Monthly budgets</h3>
                <div className="text-[12px] text-muted mt-0.5">{budgets.length} categories</div>
              </div>
            </div>
            <div className="flex flex-col gap-[18px]">
              {budgets.map((b) => (
                <div key={b.cat}>
                  <div className="flex justify-between items-baseline text-[13px] mb-2">
                    <span className="font-medium">{b.cat}</span>
                    <span className="text-muted text-[12.5px]"><strong className="text-ink font-serif font-medium">{symbol}{b.spent.toLocaleString()}</strong> / {symbol}{b.limit.toLocaleString()}</span>
                  </div>
                  <div className="h-[5px] rounded-full bg-cream-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${b.pct > 90 ? "bg-accent-red" : b.pct > 70 ? "bg-gold" : "bg-accent-green"}`} style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-ink text-cream rounded-xl p-7 relative overflow-hidden">
          <div className="absolute -top-[50px] -right-[50px] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(166,124,46,.18),transparent_65%)]" />
          <div className="flex justify-between items-center mb-[18px] relative z-[2]">
            <h3 className="font-serif text-[18px] font-medium italic text-cream">Insights</h3>
            <span className="text-[11px] text-gold-soft tracking-[.1em] uppercase font-semibold">— Auto-generated</span>
          </div>
          <div className="flex flex-col gap-3.5 relative z-[2]">
            <div className="flex gap-3.5 p-3.5 bg-white/[.05] rounded-[10px] border border-white/[.08]">
              <div className="w-9 h-9 rounded-[9px] bg-gold/18 text-gold-soft grid place-items-center text-[15px] flex-shrink-0">📊</div>
              <div>
                <div className="text-[13.5px] font-medium text-cream mb-0.5">You have {expenses.length} transactions</div>
                <div className="text-[12.5px] text-cream-3 opacity-80 leading-[1.5]">
                  {totalIncome > totalExpenses
                    ? `You're saving ${savingsRate}% of your income — keep it up!`
                    : "Consider reducing expenses to improve your savings rate."}
                </div>
              </div>
            </div>
            {categoryData.length > 0 && (
              <div className="flex gap-3.5 p-3.5 bg-white/[.05] rounded-[10px] border border-white/[.08]">
                <div className="w-9 h-9 rounded-[9px] bg-gold/18 text-gold-soft grid place-items-center text-[15px] flex-shrink-0">⚠️</div>
                <div>
                  <div className="text-[13.5px] font-medium text-cream mb-0.5">Top spending: {categoryData[0].name}</div>
                  <div className="text-[12.5px] text-cream-3 opacity-80 leading-[1.5]">
                    {symbol}{categoryData[0].value.toLocaleString()} spent on {categoryData[0].name} — {Math.round((categoryData[0].value / totalExpenses) * 100)}% of total expenses.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
