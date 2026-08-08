"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCurrency } from "../components/CurrencyContext";
import { useAuth } from "../components/AuthContext";
import Sidebar from "../components/Sidebar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Expense {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export default function ReportsPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    fetch(`/api/expenses?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setExpenses(d.expenses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const totalIncome = expenses.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpenses = expenses.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExpenses;

  const categoryMap: Record<string, number> = {};
  expenses.filter((e) => e.type === "expense").forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const colors = ["#A67C2E", "#4338CA", "#D4B876", "#A23B3B", "#2D2A6E", "#2F6F4E"];
  const categoryData = Object.entries(categoryMap)
    .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
    .sort((a, b) => b.value - a.value);

  const monthMap: Record<string, number> = {};
  expenses.filter((e) => e.type === "expense").forEach((e) => {
    const m = e.date.slice(0, 7);
    monthMap[m] = (monthMap[m] || 0) + e.amount;
  });
  const monthlyData = Object.entries(monthMap).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month));

  const topExpense = expenses.filter((e) => e.type === "expense").sort((a, b) => b.amount - a.amount)[0];

  if (loading) return <div className="flex min-h-screen bg-cream items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Reports" />

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[1100px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
          <div>
            <div className="text-[13px] text-muted mb-1.5">Financial overview</div>
            <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]">Reports</h2>
          </div>
          <div className="flex gap-1">
            {["weekly", "monthly", "yearly"].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`text-[13px] font-medium px-4 py-2 rounded-lg transition-colors capitalize ${period === p ? "bg-ink text-cream" : "bg-cream-2 text-muted hover:text-ink"}`}>{p}</button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-4 mb-6">
          <div className="bg-white border border-line rounded-xl p-6">
            <div className="text-[11.5px] uppercase tracking-[.08em] mb-2 font-medium text-muted">Total Income</div>
            <div className="font-serif text-[28px] font-medium text-accent-green">{symbol}{totalIncome.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-line rounded-xl p-6">
            <div className="text-[11.5px] uppercase tracking-[.08em] mb-2 font-medium text-muted">Total Expenses</div>
            <div className="font-serif text-[28px] font-medium text-accent-red">{symbol}{totalExpenses.toLocaleString()}</div>
          </div>
          <div className="bg-white border border-line rounded-xl p-6">
            <div className="text-[11.5px] uppercase tracking-[.08em] mb-2 font-medium text-muted">Net Savings</div>
            <div className={`font-serif text-[28px] font-medium ${savings >= 0 ? "text-accent-green" : "text-accent-red"}`}>{symbol}{savings.toLocaleString()}</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 max-[800px]:grid-cols-1 gap-4 mb-4">
          <div className="bg-white border border-line rounded-xl p-6">
            <h3 className="font-serif text-[18px] font-medium tracking-[-.015em] mb-4">Spending by category</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={110} innerRadius={70} dataKey="value" strokeWidth={3} stroke="#FAF7F2">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${symbol}${Number(value).toLocaleString()}`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid #E8E3D8", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-[14px] text-muted">No expense data yet</div>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-[12px]">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-muted">{c.name}</span>
                  <span className="font-medium">{symbol}{c.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 max-[800px]:grid-cols-1 gap-4 mb-4">
          <div className="bg-white border border-line rounded-xl p-6">
            <h3 className="font-serif text-[18px] font-medium tracking-[-.015em] mb-4">Monthly trend</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7DA" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#8B87A8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#8B87A8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${symbol}${v / 1000}k`} />
                  <Tooltip formatter={(value) => [`${symbol}${Number(value).toLocaleString()}`, "Expenses"]} contentStyle={{ borderRadius: 8, border: "1px solid #E8E3D8", fontSize: 12 }} />
                  <Bar dataKey="amount" fill="#4338CA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-[14px] text-muted">No data yet</div>
            )}
          </div>
        </div>

        {/* Top expense */}
        {topExpense && (
          <div className="bg-white border border-line rounded-xl p-6">
            <h3 className="font-serif text-[18px] font-medium tracking-[-.015em] mb-4">Top expense</h3>
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-cream-2 grid place-items-center text-[18px]">💸</div>
              <div className="flex-1">
                <div className="text-[15px] font-medium">{topExpense.title}</div>
                <div className="text-[12px] text-muted">{topExpense.category} · {topExpense.date}</div>
              </div>
              <div className="font-serif text-[18px] font-medium text-accent-red">−{symbol}{topExpense.amount.toLocaleString()}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
