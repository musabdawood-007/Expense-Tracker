"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, ArrowLeftRight, Target, Trophy, BarChart3, Repeat, Settings, Download,
  Wallet, LogOut, Menu, X, Users,
} from "lucide-react";
import { useAuth } from "./AuthContext";

const mainNav = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ArrowLeftRight, label: "Transactions", href: "/expenses" },
  { icon: Target, label: "Budgets", href: "/budgets" },
  { icon: Trophy, label: "Goals", href: "/goals" },
];

const moreNav = [
  { icon: Users, label: "Rooms", href: "/rooms" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Repeat, label: "Recurring", href: "/recurring" },
  { icon: Download, label: "Export", href: "/export" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const mobileNav = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: ArrowLeftRight, label: "Trans.", href: "/expenses" },
  { icon: Users, label: "Rooms", href: "/rooms" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Settings, label: "More", href: "/settings" },
];

export default function Sidebar({ active }: { active: string }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (label: string) => label === active;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-[230px] bg-cream-2 border-r border-line p-7 sticky top-0 h-screen flex flex-col max-[900px]:hidden">
        <Link href="/" className="flex items-center gap-2.5 font-serif font-semibold text-[19px] tracking-tight text-ink mb-7">
          <span className="w-[30px] h-[30px] rounded-lg bg-ink text-cream grid place-items-center text-[14px] font-serif font-semibold">
            <Wallet size={13} strokeWidth={2.5} />
          </span>
          SpendWise
        </Link>

        <div className="mb-5">
          <div className="text-[10.5px] font-semibold text-muted-2 tracking-[.1em] uppercase px-3.5 mb-2">Main</div>
          <nav className="flex flex-col gap-0.5">
            {mainNav.map(({ icon: Icon, label, href }) => (
              <Link key={label} href={href} className={`flex items-center gap-3 px-3.5 py-[11px] rounded-lg text-[13.5px] font-medium transition-colors ${isActive(label) ? "bg-ink text-cream" : "text-muted hover:bg-cream-3 hover:text-ink"}`}>
                <Icon size={15} strokeWidth={isActive(label) ? 2.2 : 1.8} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mb-5">
          <div className="text-[10.5px] font-semibold text-muted-2 tracking-[.1em] uppercase px-3.5 mb-2">More</div>
          <nav className="flex flex-col gap-0.5">
            {moreNav.map(({ icon: Icon, label, href }) => (
              <Link key={label} href={href} className={`flex items-center gap-3 px-3.5 py-[11px] rounded-lg text-[13.5px] font-medium transition-colors ${isActive(label) ? "bg-ink text-cream" : "text-muted hover:bg-cream-3 hover:text-ink"}`}>
                <Icon size={15} strokeWidth={1.8} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-2 bg-cream-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-ink text-cream grid place-items-center text-[13px] font-semibold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-medium text-ink truncate">{user?.name || "User"}</div>
              <div className="text-[11px] text-muted truncate">{user?.email || ""}</div>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3.5 py-[11px] rounded-lg text-[13.5px] font-medium text-muted hover:bg-cream-3 hover:text-ink transition-colors">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-[60] w-11 h-11 rounded-lg bg-ink text-cream grid place-items-center shadow-lg min-[901px]:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[55] min-[901px]:hidden">
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[260px] bg-cream-2 border-r border-line p-6 flex flex-col">
            <div className="flex justify-between items-center mb-7">
              <Link href="/" className="flex items-center gap-2.5 font-serif font-semibold text-[19px] tracking-tight text-ink" onClick={() => setMobileOpen(false)}>
                <span className="w-[30px] h-[30px] rounded-lg bg-ink text-cream grid place-items-center text-[14px] font-serif font-semibold">
                  <Wallet size={13} strokeWidth={2.5} />
                </span>
                SpendWise
              </Link>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg bg-cream-3 grid place-items-center text-muted hover:text-ink">
                <X size={16} />
              </button>
            </div>

            <div className="mb-5">
              <div className="text-[10.5px] font-semibold text-muted-2 tracking-[.1em] uppercase px-3.5 mb-2">Main</div>
              <nav className="flex flex-col gap-0.5">
                {mainNav.map(({ icon: Icon, label, href }) => (
                  <Link key={label} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3.5 py-[11px] rounded-lg text-[13.5px] font-medium transition-colors ${isActive(label) ? "bg-ink text-cream" : "text-muted hover:bg-cream-3 hover:text-ink"}`}>
                    <Icon size={15} strokeWidth={isActive(label) ? 2.2 : 1.8} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mb-5">
              <div className="text-[10.5px] font-semibold text-muted-2 tracking-[.1em] uppercase px-3.5 mb-2">More</div>
              <nav className="flex flex-col gap-0.5">
                {moreNav.map(({ icon: Icon, label, href }) => (
                  <Link key={label} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3.5 py-[11px] rounded-lg text-[13.5px] font-medium transition-colors ${isActive(label) ? "bg-ink text-cream" : "text-muted hover:bg-cream-3 hover:text-ink"}`}>
                    <Icon size={15} strokeWidth={1.8} />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-2 bg-cream-3 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-ink text-cream grid place-items-center text-[13px] font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-ink truncate">{user?.name || "User"}</div>
                  <div className="text-[11px] text-muted truncate">{user?.email || ""}</div>
                </div>
              </div>
              <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-2 px-3.5 py-[11px] rounded-lg text-[13.5px] font-medium text-muted hover:bg-cream-3 hover:text-ink transition-colors">
                <LogOut size={15} /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cream-2 border-t border-line flex justify-around items-center h-16 px-2 min-[901px]:hidden safe-area-bottom">
        {mobileNav.map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isActive(label) ? "text-ink" : "text-muted"}`}>
            <Icon size={20} strokeWidth={isActive(label) ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
