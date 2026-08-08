"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Trash2, Repeat } from "lucide-react";
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

export default function RecurringPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    fetch(`/api/expenses?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setExpenses(d.expenses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const recurring = expenses.filter((e) =>
    e.title.toLowerCase().includes("subscription") ||
    e.title.toLowerCase().includes("membership") ||
    e.title.toLowerCase().includes("recurring") ||
    e.category === "Entertainment" ||
    e.category === "Utilities"
  );

  const totalRecurring = recurring.reduce((s, e) => s + e.amount, 0);

  if (loading) return <div className="flex min-h-screen bg-cream items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" /></div>;

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Recurring" />

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[1100px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
          <div>
            <div className="text-[13px] text-muted mb-1.5">Subscriptions & recurring</div>
            <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]" text-ink>Recurring</h2>
          </div>
          <div className="bg-white border border-line rounded-xl px-5 py-3">
            <div className="text-[11.5px] uppercase tracking-[.08em] text-muted mb-1">Monthly total</div>
            <div className="font-serif text-[22px] font-medium text-accent-red">{symbol}{totalRecurring.toLocaleString()}</div>
          </div>
        </div>

        {recurring.length === 0 ? (
          <div className="text-center py-20">
            <Repeat className="mx-auto text-muted mb-4" size={40} />
            <h3 className="font-serif text-[22px] font-medium mb-2" text-ink>No recurring expenses</h3>
            <p className="text-[14px] text-muted">Your subscriptions and recurring charges will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-line rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] font-semibold text-muted uppercase tracking-[.06em] border-b border-line">
                  <th className="text-left px-6 py-3">Expense</th>
                  <th className="text-left px-6 py-3 max-[600px]:hidden">Category</th>
                  <th className="text-left px-6 py-3 max-[600px]:hidden">Date</th>
                  <th className="text-right px-6 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recurring.map((e) => (
                  <tr key={e._id} className="border-b border-line/50 last:border-0 hover:bg-cream-2 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-[38px] h-[38px] rounded-[9px] bg-cream-2 grid place-items-center text-[16px]">🔁</div>
                        <div>
                          <div className="text-[14px] font-medium text-ink">{e.title}</div>
                          <div className="text-[12px] text-muted">Recurring</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-muted max-[600px]:hidden">{e.category}</td>
                    <td className="px-6 py-3.5 text-[13px] text-muted max-[600px]:hidden">{e.date}</td>
                    <td className="px-6 py-3.5 text-right font-serif text-[15px] font-medium text-accent-red">−{symbol}{e.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
