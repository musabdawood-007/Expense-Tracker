"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Plus, Trash2, Copy, Check, Users, ArrowLeft } from "lucide-react";
import { useCurrency } from "../components/CurrencyContext";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";
import Sidebar from "../components/Sidebar";

interface RoomExpense {
  title: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
  date: string;
}

interface Room {
  _id: string;
  code: string;
  name: string;
  createdBy: string;
  members: string[];
  expenses: RoomExpense[];
  settled: boolean;
}

function RoomsContent() {
  const { symbol } = useCurrency();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdParam = searchParams.get("room");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [view, setView] = useState<"list" | "create" | "join" | "room">("list");
  const [copied, setCopied] = useState(false);

  const [newName, setNewName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [expSplit, setExpSplit] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/login"); return; }
    if (!user.verified) { router.push(`/auth/verify?email=${encodeURIComponent(user.email)}`); return; }
    fetch(`/api/rooms?userId=${user.id}&userName=${encodeURIComponent(user.name)}`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.rooms || [];
        setRooms(list);
        setLoading(false);
        if (roomIdParam) {
          const found = list.find((r: Room) => r._id === roomIdParam);
          if (found) { setActiveRoom(found); setView("room"); }
        }
      })
      .catch(() => setLoading(false));
  }, [user, authLoading, router, roomIdParam]);

  const openRoom = (room: Room) => {
    setActiveRoom(room);
    setView("room");
    router.replace(`/rooms?room=${room._id}`, { scroll: false });
  };

  const backToList = () => {
    setActiveRoom(null);
    setView("list");
    router.replace("/rooms", { scroll: false });
  };

  const handleCreate = async () => {
    if (!user || !newName || !memberName) return;
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, name: newName, memberName }),
    });
    const d = await res.json();
    if (d.room) {
      setRooms((prev) => [d.room, ...prev]);
      setActiveRoom(d.room);
      setView("room");
      router.replace(`/rooms?room=${d.room._id}`, { scroll: false });
      setNewName("");
      setMemberName("");
      addToast(`Room created — code: ${d.room.code}`);
    }
  };

  const handleJoin = async () => {
    if (!user || !joinCode || !memberName) return;
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", code: joinCode, memberName: user.name || memberName }),
    });
    const d = await res.json();
    if (d.error) { addToast(d.error, "error"); return; }
    if (d.room) {
      setRooms((prev) => {
        const exists = prev.find((r) => r._id === d.room._id);
        if (exists) return prev.map((r) => r._id === d.room._id ? d.room : r);
        return [d.room, ...prev];
      });
      setActiveRoom(d.room);
      setView("room");
      router.replace(`/rooms?room=${d.room._id}`, { scroll: false });
      setJoinCode("");
      addToast("Joined room");
    }
  };

  const handleAddExpense = async () => {
    if (!activeRoom || !expTitle || !expAmount || !expPaidBy) return;
    const splitList = expSplit ? expSplit.split(",").map((s) => s.trim()).filter(Boolean) : activeRoom.members;
    const expense = {
      title: expTitle,
      amount: Number(expAmount),
      paidBy: expPaidBy,
      splitAmong: splitList,
      date: new Date().toISOString().split("T")[0],
    };
    const res = await fetch("/api/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: activeRoom._id, expense }),
    });
    const d = await res.json();
    if (d.room) {
      setActiveRoom(d.room);
      setRooms((prev) => prev.map((r) => r._id === d.room._id ? d.room : r));
      setExpTitle("");
      setExpAmount("");
      setExpPaidBy("");
      setExpSplit("");
      addToast("Expense added to room");
    }
  };

  const handleSettle = async (roomId: string) => {
    if (!confirm("Settle all balances and close this room?")) return;
    await fetch("/api/rooms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, settle: true }),
    });
    setRooms((prev) => prev.filter((r) => r._id !== roomId));
    backToList();
    addToast("Room settled and closed");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    await fetch(`/api/rooms?id=${id}`, { method: "DELETE" });
    setRooms((prev) => prev.filter((r) => r._id !== id));
    if (activeRoom?._id === id) backToList();
    addToast("Room deleted");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBalances = (room: Room) => {
    const balances: Record<string, number> = {};
    room.members.forEach((m) => { balances[m] = 0; });
    room.expenses.forEach((e) => {
      const share = e.amount / e.splitAmong.length;
      balances[e.paidBy] = (balances[e.paidBy] || 0) + e.amount;
      e.splitAmong.forEach((m) => {
        balances[m] = (balances[m] || 0) - share;
      });
    });
    return balances;
  };

  if (authLoading || loading) return <div className="flex min-h-screen bg-cream items-center justify-center"><div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" /></div>;

  return (
    <>
      {/* LIST VIEW */}
      {view === "list" && (
        <>
          <div className="flex justify-between items-end mb-8 flex-wrap gap-3.5">
            <div>
              <div className="text-[13px] text-muted mb-1.5">Split bills with friends</div>
              <h2 className="font-serif text-[32px] font-medium tracking-[-.02em] max-[600px]:text-[24px]" text-ink>Rooms</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setView("join")} className="flex items-center gap-2 px-[18px] py-2.5 rounded-lg border border-line-2 text-[14px] font-medium text-ink hover:border-ink transition-all">
                Join room
              </button>
              <button onClick={() => setView("create")} className="flex items-center gap-2 px-[18px] py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">
                <Plus size={15} strokeWidth={2.5} /> New room
              </button>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-20">
              <Users className="mx-auto text-muted mb-4" size={40} />
              <h3 className="font-serif text-[22px] font-medium mb-2" text-ink>No rooms yet</h3>
              <p className="text-[14px] text-muted mb-6 max-w-[360px] mx-auto">Create a room to split cafe bills, rent, or expenses with friends. Share a 6-digit code to let them join.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setView("create")} className="px-5 py-2.5 rounded-lg bg-ink text-cream text-[14px] font-medium hover:bg-ink-2 transition-all">Create a room</button>
                <button onClick={() => setView("join")} className="px-5 py-2.5 rounded-lg border border-line-2 text-[14px] font-medium text-ink hover:border-ink transition-all">Join with code</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 max-[800px]:grid-cols-1 gap-4">
              {rooms.map((room) => (
                <div key={room._id} className="bg-white border border-line rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer" onClick={() => openRoom(room)}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-serif text-[20px] font-medium" text-ink>{room.name}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); copyCode(room.code); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-2 text-[12px] font-mono font-semibold text-ink hover:bg-cream-3 transition-colors">
                        {room.code} {copied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(room._id); }} className="w-8 h-8 rounded-lg bg-cream-2 text-muted grid place-items-center hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {room.members.slice(0, 5).map((m, i) => (
                      <div key={i} className="w-7 h-7 rounded-full bg-ink text-cream grid place-items-center text-[10px] font-semibold -ml-1 first:ml-0 border-2 border-white">{m.charAt(0).toUpperCase()}</div>
                    ))}
                    {room.members.length > 5 && <span className="text-[11px] text-muted ml-1">+{room.members.length - 5}</span>}
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted">{room.members.length} members · {room.expenses.length} expenses</span>
                    <span className="font-medium text-ink">{symbol}{room.expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()} total</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CREATE VIEW */}
      {view === "create" && (
        <div className="max-w-[480px]">
          <button onClick={backToList} className="flex items-center gap-1.5 text-[13px] text-muted mb-6 hover:text-ink transition-colors"><ArrowLeft size={14} /> Back</button>
          <h2 className="font-serif text-[28px] font-medium mb-6" text-ink>Create a room</h2>
          <div className="mb-4">
            <label className="block text-[12.5px] font-medium mb-2 text-ink">Room name</label>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Cafe Split, Hostel 4" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
          </div>
          <div className="mb-6">
            <label className="block text-[12.5px] font-medium mb-2 text-ink">Your name (in this room)</label>
            <input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="e.g. Ali" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
          </div>
          <button onClick={handleCreate} disabled={!newName || !memberName} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">Create room</button>
        </div>
      )}

      {/* JOIN VIEW */}
      {view === "join" && (
        <div className="max-w-[480px]">
          <button onClick={backToList} className="flex items-center gap-1.5 text-[13px] text-muted mb-6 hover:text-ink transition-colors"><ArrowLeft size={14} /> Back</button>
          <h2 className="font-serif text-[28px] font-medium mb-6" text-ink>Join a room</h2>
          <div className="mb-4">
            <label className="block text-[12.5px] font-medium mb-2 text-ink">6-digit room code</label>
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. 482910" maxLength={6} className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted font-mono text-[20px] tracking-[.2em] text-center focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
          </div>
          <div className="mb-6">
            <label className="block text-[12.5px] font-medium mb-2 text-ink">Your name</label>
            <input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="e.g. Ahmed" className="w-full px-3.5 py-[13px] border border-line-2 rounded-lg text-[14.5px] bg-white text-ink placeholder:text-muted focus:border-ink focus:shadow-[0_0_0_3px_rgba(30,27,75,.08)]" />
          </div>
          <button onClick={handleJoin} disabled={!joinCode || joinCode.length !== 6 || !memberName} className="w-full py-[15px] rounded-lg bg-ink text-cream text-[15px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">Join room</button>
        </div>
      )}

      {/* ROOM DETAIL VIEW */}
      {view === "room" && activeRoom && (
        <div>
          <button onClick={backToList} className="flex items-center gap-1.5 text-[13px] text-muted mb-6 hover:text-ink transition-colors"><ArrowLeft size={14} /> Back to rooms</button>

          <div className="flex justify-between items-end mb-6 flex-wrap gap-3.5">
            <div>
              <h2 className="font-serif text-[28px] font-medium max-[600px]:text-[22px]" text-ink>{activeRoom.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <button onClick={() => copyCode(activeRoom.code)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cream-2 text-[13px] font-mono font-semibold text-ink hover:bg-cream-3 transition-colors">
                  Code: {activeRoom.code} {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
                <span className="text-[13px] text-muted">{activeRoom.members.length} members</span>
              </div>
            </div>
            <button onClick={() => handleSettle(activeRoom._id)} className="px-4 py-2.5 rounded-lg border border-line-2 text-[13px] font-medium text-ink hover:border-ink transition-all">Settle & close</button>
          </div>

          {/* Members */}
          <div className="bg-white border border-line rounded-xl p-5 mb-4">
            <h3 className="font-serif text-[16px] font-medium mb-3" text-ink>Members</h3>
            <div className="flex flex-wrap gap-2">
              {activeRoom.members.map((m, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-2 text-[13px] font-medium">
                  <div className="w-6 h-6 rounded-full bg-ink text-cream grid place-items-center text-[10px] font-semibold">{m.charAt(0).toUpperCase()}</div>
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Add expense */}
          <div className="bg-white border border-line rounded-xl p-5 mb-4">
            <h3 className="font-serif text-[16px] font-medium mb-3" text-ink>Add expense</h3>
            <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3 mb-3">
              <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="Title (e.g. Cafe bill)" className="px-3.5 py-[11px] border border-line-2 rounded-lg text-[13px] bg-white text-ink placeholder:text-muted focus:border-ink" />
              <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder={`Amount (${symbol})`} className="px-3.5 py-[11px] border border-line-2 rounded-lg text-[13px] bg-white text-ink placeholder:text-muted focus:border-ink" />
            </div>
            <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3 mb-3">
              <select value={expPaidBy} onChange={(e) => setExpPaidBy(e.target.value)} className="px-3.5 py-[11px] border border-line-2 rounded-lg text-[13px] bg-white text-ink focus:border-ink">
                <option value="">Paid by...</option>
                {activeRoom.members.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input value={expSplit} onChange={(e) => setExpSplit(e.target.value)} placeholder="Split among (comma names, or leave for all)" className="px-3.5 py-[11px] border border-line-2 rounded-lg text-[13px] bg-white text-ink placeholder:text-muted focus:border-ink" />
            </div>
            <button onClick={handleAddExpense} disabled={!expTitle || !expAmount || !expPaidBy} className="px-5 py-2.5 rounded-lg bg-ink text-cream text-[13px] font-medium hover:bg-ink-2 transition-all disabled:opacity-50">Add expense</button>
          </div>

          {/* Balances */}
          {activeRoom.expenses.length > 0 && (
            <div className="bg-white border border-line rounded-xl p-5 mb-4">
              <h3 className="font-serif text-[16px] font-medium mb-3" text-ink>Balances</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(getBalances(activeRoom)).map(([name, bal]) => (
                  <div key={name} className={`px-4 py-3 rounded-lg text-[13px] font-medium border ${bal > 0 ? "bg-accent-green/10 text-accent-green border-accent-green/20" : bal < 0 ? "bg-accent-red/10 text-accent-red border-accent-red/20" : "bg-cream-2 text-muted border-line"}`}>
                    {name}: {bal > 0 ? `gets ${symbol}${Math.abs(bal).toLocaleString()}` : bal < 0 ? `owes ${symbol}${Math.abs(bal).toLocaleString()}` : "settled"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expense list */}
          {activeRoom.expenses.length > 0 && (
            <div className="bg-white border border-line rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-[11px] font-semibold text-muted uppercase tracking-[.06em] border-b border-line">
                    <th className="text-left px-5 py-3">Expense</th>
                    <th className="text-left px-5 py-3 max-[600px]:hidden">Paid by</th>
                    <th className="text-left px-5 py-3 max-[600px]:hidden">Split</th>
                    <th className="text-right px-5 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRoom.expenses.map((e, i) => (
                    <tr key={i} className="border-b border-line/50 last:border-0 hover:bg-cream-2 transition-colors">
                      <td className="px-5 py-3 text-[13px] font-medium">{e.title}</td>
                      <td className="px-5 py-3 text-[13px] text-muted max-[600px]:hidden">{e.paidBy}</td>
                      <td className="px-5 py-3 text-[12px] text-muted max-[600px]:hidden">{e.splitAmong.join(", ")}</td>
                      <td className="px-5 py-3 text-right font-serif text-[14px] font-medium text-ink">{symbol}{e.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function RoomsPage() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active="Rooms" />
      <main className="flex-1 p-[36px_40px] pb-28 max-w-[1100px] mx-auto w-full max-[600px]:p-[24px_16px_100px] max-[900px]:pl-[60px]">
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-6 w-6 rounded-full border-2 border-ink/20 border-t-ink animate-spin" /></div>}>
          <RoomsContent />
        </Suspense>
      </main>
    </div>
  );
}
