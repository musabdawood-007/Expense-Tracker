"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setMounted(true);
  }, []);

  const toggle = () => {};

  return (
    <ThemeContext.Provider value={{ theme: "light", toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
