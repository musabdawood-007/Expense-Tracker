"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "PKR" | "USD" | "AED" | "INR" | "EURO";

const currencies: Record<Currency, { symbol: string; label: string }> = {
  PKR: { symbol: "₨", label: "PKR — Pakistani Rupee" },
  USD: { symbol: "$", label: "USD — US Dollar" },
  AED: { symbol: "د.إ", label: "AED — UAE Dirham" },
  INR: { symbol: "₹", label: "INR — Indian Rupee" },
  EURO: { symbol: "€", label: "EUR — Euro" },
};

const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
}>({ currency: "PKR", setCurrency: () => {}, symbol: "₨" });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("PKR");

  useEffect(() => {
    const saved = localStorage.getItem("currency") as Currency | null;
    if (saved && currencies[saved]) setCurrencyState(saved);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, symbol: currencies[currency].symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export { currencies };
export type { Currency };
