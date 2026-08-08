"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Users as UsersIcon, Trash2 } from "lucide-react";
import { useCurrency } from "../components/CurrencyContext";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import Sidebar from "../components/Sidebar";

interface Group {
  _id: string;
  name: string;
  icon: string;
  members: string[];
  balance: number;
}

export default function GroupsPage() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupIcon, setGroupIcon] = useState("👥");
  const [members, setMembers] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/auth/login"); return; }
    if (!authLoading && user && !user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    if (!user) return;
    fetch(`/api/groups?userId=${user.id}`)
      .then((r) => r.json())
      .then((d) => { setGroups(d.groups || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, router, authLoading]);

  const handleAdd = async () => {
    if (!user || !groupName.trim()) return;
    setSaving(true);
    const memberList = members.split(",").map((m) => m.trim()).filter(Boolean);
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, name: groupName, icon: groupIcon, members: memberList, balance: 0 }),
    });
    const res = await fetch(`/api/groups?userId=${user.id}`);
    const d = await res.json();
    setGroups(d.groups || []);
    setShowAdd(false);
    setGroupName("");
    setGroupIcon("👥");
    setMembers("");
    setSaving(false);
    addToast("Group created");
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Delete this group?")) return;
    await fetch(`/api/groups?id=${id}`, { method: "DELETE" });
    setGroups((prev) => prev.filter((g) => g._id !== id));
    addToast("Group deleted");
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
      <Sidebar active="Groups" />

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-white rounded-2xl max-w-[440px] w-full p-8 relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-muted hover:text-ink text-[18px]">✕</button>
            <h3 className="font-serif text-[24px] font-medium mb-6">New group</h3>
            <div className="mb-4">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Group name</label>
              <input value={groupName} onChange={(e) => setGroupName(e.target.value)} required className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            <div className="mb-4">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {["👥", "🏠", "✈️", "🍽️", "💼", "🎉", "🎮", "💪"].map((icon) => (
                  <button key={icon} onClick={() => setGroupIcon(icon)} className={`w-10 h-10 rounded-lg border grid place-items-center text-[18px] transition-colors ${groupIcon === icon ? "border-ink bg-cream-2" : "border-line-2 hover:border-ink"}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-[12.5px] font-medium mb-2 text-ink">Members (comma separated)</label>
              <input value={members} onChange={(e) => setMembers(e.target.value)} placeholder="Ali, Ahmed, Sara" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
            </div>
            <button onClick={handleAdd} disabled={!groupName.trim() || saving} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">{saving ? "Creating..." : "Create group"}</button>
          </div>
        </div>
      )}

      <main className="flex-1 p-[36px_40px] pb-28 max-w-[1100px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
          <div>
            <div className="text-[13px] text-muted mb-1.5">{today}</div>
            <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]">Groups</h2>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-[18px] py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">
            <Plus size={15} strokeWidth={2.5} /> New group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="text-center py-20">
            <UsersIcon className="mx-auto text-muted mb-4" size={40} />
            <h3 className="font-serif text-[22px] font-medium mb-2">No groups yet</h3>
            <p className="text-[14px] text-muted mb-6">Create a group to start splitting expenses with friends.</p>
            <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">
              Create your first group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 max-[800px]:grid-cols-1 gap-4">
            {groups.map((g) => (
              <div key={g._id} className="bg-white border border-line rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer relative">
                <button onClick={() => handleDelete(g._id)} className="absolute top-4 right-4 text-muted hover:text-accent-red transition-colors">
                  <Trash2 size={14} />
                </button>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-[10px] bg-cream-2 border border-line grid place-items-center text-[20px]">{g.icon}</div>
                  <span className={`text-[13px] font-serif font-medium ${g.balance >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {g.balance >= 0 ? "+" : "−"}{symbol}{Math.abs(g.balance).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-serif text-[18px] font-medium mb-2">{g.name}</h3>
                <div className="flex items-center gap-1">
                  {g.members.slice(0, 4).map((m, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-ink text-cream grid place-items-center text-[9px] font-semibold -ml-1 first:ml-0 border-2 border-white">
                      {m.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {g.members.length > 4 && <span className="text-[11px] text-muted ml-1">+{g.members.length - 4}</span>}
                </div>
                <div className="mt-3 text-[12px] text-muted">{g.members.length} members</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
