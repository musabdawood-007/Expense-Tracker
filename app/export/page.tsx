"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Download, FileText, Table } from "lucide-react";
import { useCurrency } from "../components/CurrencyContext";
import { useAuth } from "../components/AuthContext";
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

interface Budget {
  _id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

interface Goal {
  _id: string;
  name: string;
  icon: string;
  target: number;
  saved: number;
  deadline: string;
}

export default function ExportPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    Promise.all([
      fetch(`/api/expenses?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/budgets?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/goals?userId=${user.id}`).then((r) => r.json()),
    ]).then(([e, b, g]) => {
      setExpenses(e.expenses || []);
      setBudgets(b.budgets || []);
      setGoals(g.goals || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const exportCSV = () => {
    const headers = ["Title", "Amount", "Type", "Category", "Date", "Note"];
    const rows = expenses.map((e) => [e.title, e.amount, e.type, e.category, e.date, e.note || ""]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spendwise-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      currency: symbol,
      transactions: expenses,
      budgets,
      goals,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spendwise-all-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex min-h-screen bg-cream items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Export" />

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[800px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="mb-8">
          <div className="text-[13px] text-muted mb-1.5">Download your data</div>
          <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]" style={{ color: "#1E1B4B" }}>Export</h2>
        </div>

        <div className="bg-white border border-line rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-cream-2 border border-line grid place-items-center">
              <Table size={18} className="text-ink" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-medium" style={{ color: "#1E1B4B" }}>CSV Export</h3>
              <p className="text-[12px] text-muted">Transactions only — spreadsheet format for Excel & Google Sheets</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">{expenses.length} transactions</span>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-cream text-[13px] font-medium hover:bg-ink-2 transition-all">
              <Download size={14} /> Download CSV
            </button>
          </div>
        </div>

        <div className="bg-white border border-line rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-[10px] bg-cream-2 border border-line grid place-items-center">
              <FileText size={18} className="text-ink" />
            </div>
            <div>
              <h3 className="font-serif text-[18px] font-medium" style={{ color: "#1E1B4B" }}>Full JSON Export</h3>
              <p className="text-[12px] text-muted">Everything — transactions, budgets, goals in one file</p>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[13px] text-muted">{expenses.length} transactions · {budgets.length} budgets · {goals.length} goals</span>
            <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-cream text-[13px] font-medium hover:bg-ink-2 transition-all">
              <Download size={14} /> Download JSON
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
