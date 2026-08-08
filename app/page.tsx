"use client";

import Link from "next/link";
import { Wallet, ChevronDown } from "lucide-react";
import { useCurrency, currencies, Currency } from "./components/CurrencyContext";
import { useState, useRef, useEffect } from "react";

const features = [
  { num: "01", icon: "⚡", title: "Track expenses", desc: "Add income or expenses in seconds. Smart categories do the boring part for you." },
  { num: "02", icon: "📊", title: "Clear analytics", desc: "See where every dollar goes with elegant charts. Trends become obvious." },
  { num: "03", icon: "🎯", title: "Set budgets", desc: "Monthly limits per category. We nudge you softly before you overspend." },
  { num: "04", icon: "🏆", title: "Savings goals", desc: "Visualize what you're saving for and watch progress fill, month by month." },
  { num: "05", icon: "👥", title: "Split with rooms", desc: "Create rooms, share a 6-digit code, and split bills with friends instantly." },
  { num: "06", icon: "📥", title: "Export data", desc: "Download CSVs or JSONs. Your data, your format, your control." },
];

const steps = [
  { num: "01", title: "Sign up", desc: "Create a free account in seconds. Your data is encrypted end-to-end." },
  { num: "02", title: "Add transactions", desc: "Log expenses manually. Smart categories make it effortless." },
  { num: "03", title: "Set budgets", desc: "Tell SpendWise your monthly limits. We'll gently warn you." },
  { num: "04", title: "Watch savings grow", desc: "Hit your goals and build financial habits that quietly compound." },
];

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
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line-2 bg-white/80 text-[13px] font-medium text-ink hover:border-ink transition-colors">
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

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-cream/85 backdrop-blur-xl border-b border-line">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-[14px] md:py-[18px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif font-semibold text-[18px] md:text-[22px] tracking-tight text-ink">
            <span className="w-[30px] h-[30px] md:w-[34px] md:h-[34px] rounded-[9px] bg-ink text-cream grid place-items-center text-[14px] md:text-[16px] font-serif font-semibold">
              <Wallet size={14} strokeWidth={2.5} />
            </span>
            SpendWise
          </Link>
          <div className="hidden md:flex items-center gap-9">
            {["Features", "How it works"].map((item) => (
              <a key={item} href={item === "Features" ? "#features" : "#how"} className="text-[14px] font-normal text-muted hover:text-ink transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <CurrencyDropdown />
            <Link href="/auth/login" className="hidden sm:inline-flex px-4 py-[9px] rounded-lg border border-line-2 text-[13px] md:text-[14px] font-medium text-ink hover:bg-cream-2 transition-all">
              Log in
            </Link>
            <Link href="/auth/login" className="px-4 md:px-[18px] py-[9px] md:py-[10px] rounded-lg bg-ink text-cream border border-ink text-[13px] md:text-[14px] font-medium hover:bg-ink-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(30,27,75,.4)]">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-16 md:pt-20 pb-12 md:pb-16 px-5 md:px-8 text-center max-w-[1100px] mx-auto relative">
        <span className="inline-flex items-center gap-2 bg-cream-2 border border-line-2 px-4 py-[7px] rounded-full text-[11px] md:text-[12.5px] font-medium text-ink-3 tracking-[.04em] uppercase mb-6 md:mb-8">
          <span className="w-[6px] h-[6px] rounded-full bg-gold shadow-[0_0_0_3px_rgba(166,124,46,.15)]" />
          For people who care about their money
        </span>
        <h1 className="text-[36px] sm:text-[52px] md:text-[72px] lg:text-[84px] font-normal leading-none tracking-[-.035em] mb-5 md:mb-6">
          Spend with intention.<br />Save with <em className="italic text-indigo font-medium" style={{ fontStyle: "italic" }}>clarity</em>.
        </h1>
        <p className="text-[15px] md:text-[19px] text-muted max-w-[580px] mx-auto mb-8 md:mb-9 leading-relaxed px-2">
          SpendWise is a quiet, considered expense tracker — built for thoughtful people who&apos;d rather understand their money than merely track it.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-12 md:mb-20">
          <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 md:px-[30px] py-3.5 md:py-4 rounded-lg bg-ink text-cream border border-ink text-[14px] md:text-[15px] font-medium hover:bg-ink-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(30,27,75,.4)] group">
            Start free <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="flex justify-center gap-5 md:gap-9 flex-wrap text-muted text-[12px] md:text-[13px] pt-6 md:pt-8 border-t border-line max-w-[680px] mx-auto">
          <span className="flex items-center gap-1.5"><span className="text-ink font-semibold">✓</span> Free forever</span>
          <span className="flex items-center gap-1.5"><span className="text-ink font-semibold">✓</span> No credit card</span>
          <span className="flex items-center gap-1.5"><span className="text-ink font-semibold">✓</span> Bank-grade encryption</span>
        </div>
      </header>

      {/* App preview */}
      <div className="max-w-[1080px] mx-auto px-5 md:px-8 pb-16 md:pb-24">
        <div className="bg-white border border-line-2 rounded-[14px] md:rounded-[18px] p-2.5 md:p-3.5 shadow-[0_40px_80px_-20px_rgba(30,27,75,.18),0_12px_24px_-10px_rgba(30,27,75,.08)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cream-2 to-transparent pointer-events-none" />
          <div className="absolute top-[18px] left-[22px] flex gap-1.5 z-2">
            <span className="w-2.5 h-2.5 rounded-full bg-line-2" />
            <span className="w-2.5 h-2.5 rounded-full bg-line-2" />
            <span className="w-2.5 h-2.5 rounded-full bg-line-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0 bg-cream rounded-[10px] overflow-hidden min-h-[300px] md:min-h-[440px] mt-6">
            <aside className="bg-cream-2 p-5 md:p-6 border-b md:border-b-0 md:border-r border-line hidden md:block">
              <div className="flex items-center gap-2 font-serif font-semibold text-[16px] mb-6">
                <span className="w-7 h-7 rounded-lg bg-ink text-cream grid place-items-center text-[13px] font-serif font-semibold">
                  <Wallet size={12} strokeWidth={2.5} />
                </span>
                SpendWise
              </div>
              {["📊 Dashboard", "💸 Transactions", "🎯 Budgets", "🏆 Goals", "📈 Reports", "⚙️ Settings"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] text-muted mb-0.5 ${i === 0 ? "bg-ink text-cream" : ""}`}>
                  {item}
                </div>
              ))}
            </aside>
            <div className="p-5 md:p-7">
              <h4 className="font-serif text-[18px] md:text-[22px] font-medium mb-1">Good morning, Ali</h4>
              <div className="text-[11px] md:text-[12.5px] text-muted mb-4 md:mb-5">Your August snapshot</div>
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-5">
                {[
                  { lbl: "Balance", val: "₨84,250", delta: "▲ 12.4%", up: true },
                  { lbl: "Income", val: "₨1,12,400", delta: "▲ 8.2%", up: true },
                  { lbl: "Expenses", val: "₨28,150", delta: "▼ 4.1%", up: false },
                ].map((s) => (
                  <div key={s.lbl} className="bg-white border border-line rounded-[10px] p-2.5 md:p-3.5">
                    <div className="text-[9px] md:text-[11px] text-muted uppercase tracking-[.05em]">{s.lbl}</div>
                    <div className="font-serif text-[15px] md:text-[22px] font-medium mt-0.5 md:mt-1 tracking-[-.02em]">{s.val}</div>
                    <div className={`text-[9px] md:text-[11px] font-medium mt-0.5 ${s.up ? "text-accent-green" : "text-accent-red"}`}>{s.delta}</div>
                  </div>
                ))}
              </div>
              <div className="h-[80px] md:h-[120px] flex items-end gap-1.5 md:gap-2.5 p-2.5 md:p-3.5 bg-white border border-line rounded-[10px]">
                {[40, 65, 30, 85, 55, 70, 45, 62, 38, 78].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t ${i === 3 ? "bg-gold" : "bg-ink"} opacity-85`} style={{ height: `${h}%`, minHeight: 6 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-8 py-16 md:py-24" id="features">
        <div className="max-w-[680px] mx-auto mb-12 md:mb-16 text-center">
          <div className="text-[11px] md:text-[12px] font-semibold text-gold uppercase tracking-[.14em] mb-3">Features</div>
          <h2 className="text-[28px] sm:text-[36px] md:text-[46px] font-normal tracking-[-.025em] mb-4 leading-[1.1]">Thoughtful tools, <em className="italic text-indigo" style={{ fontStyle: "italic" }}>quietly powerful</em></h2>
          <p className="text-[14px] md:text-[17px] text-muted leading-[1.7]">Every feature exists for a reason. No bloat, no noise — just the tools that genuinely help.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line-2 border border-line-2 rounded-xl overflow-hidden">
          {features.map((f) => (
            <div key={f.title} className="bg-cream p-6 md:p-[38px_32px] hover:bg-white transition-colors">
              <div className="font-serif italic text-[13px] md:text-[14px] text-gold mb-3 md:mb-4 tracking-[.04em]">— {f.num}</div>
              <div className="w-10 h-10 md:w-11 md:h-11 rounded-[10px] bg-cream-2 border border-line grid place-items-center text-[18px] md:text-[20px] mb-4 md:mb-5">{f.icon}</div>
              <h3 className="text-[17px] md:text-[21px] font-medium mb-2 tracking-[-.015em]">{f.title}</h3>
              <p className="text-[13px] md:text-[14.5px] text-muted leading-[1.65]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-8 pt-8 md:pt-[30px] pb-16 md:pb-24" id="how">
        <div className="max-w-[680px] mx-auto mb-12 md:mb-16 text-center">
          <div className="text-[11px] md:text-[12px] font-semibold text-gold uppercase tracking-[.14em] mb-3">How it works</div>
          <h2 className="text-[28px] sm:text-[36px] md:text-[46px] font-normal tracking-[-.025em] mb-4 leading-[1.1]">Begin in <em className="italic text-indigo" style={{ fontStyle: "italic" }}>under two minutes</em></h2>
          <p className="text-[14px] md:text-[17px] text-muted leading-[1.7]">No spreadsheets. No bank connections required. Just open the app and start tracking.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-b border-line-2">
          {steps.map((s, i) => (
            <div key={s.title} className={`py-8 md:py-[42px] px-5 md:px-7 ${i < steps.length - 1 ? "border-b sm:border-b-0 sm:border-r border-line-2" : ""}`}>
              <div className="font-serif italic text-[12px] md:text-[13px] text-gold tracking-[.05em] mb-3">— Step {s.num}</div>
              <h4 className="font-serif text-[17px] md:text-[20px] font-medium mb-2 tracking-[-.015em]">{s.title}</h4>
              <p className="text-[13px] md:text-[14px] text-muted leading-[1.65]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-8 pb-16 md:pb-24 text-center">
        <h2 className="text-[28px] sm:text-[34px] md:text-[42px] font-normal tracking-[-.025em] mb-3 md:mb-4 leading-[1.15]">Ready to begin?</h2>
        <p className="text-[14px] md:text-[16px] text-muted mb-6 md:mb-8 max-w-[480px] mx-auto">Start tracking your spending today. It&apos;s free, private, and it genuinely changes how you think about money.</p>
        <Link href="/auth/login" className="inline-flex items-center gap-2 px-6 md:px-[30px] py-3.5 md:py-4 rounded-lg bg-ink text-cream border border-ink text-[14px] md:text-[15px] font-medium hover:bg-ink-2 transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(30,27,75,.4)]">
          Get started free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-cream-3 py-6 md:py-8 px-5 md:px-8">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center text-[12px] md:text-[13px] opacity-60 flex-wrap gap-3">
          <span>© 2026 <a href="https://musab-projects.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 hover:text-cream transition-opacity underline underline-offset-2">MUSAB Projects</a>. Made with care.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:opacity-100 hover:text-cream transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-100 hover:text-cream transition-opacity">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
