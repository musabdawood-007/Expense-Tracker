"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

const ToastContext = createContext<{
  addToast: (message: string, type?: Toast["type"]) => void;
}>({ addToast: () => {} });

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-[600px]:top-auto max-[600px]:bottom-24 max-[600px]:right-3 max-[600px]:left-3">
        {toasts.map((t) => (
          <div key={t.id} onClick={() => removeToast(t.id)}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-[13px] font-medium cursor-pointer transition-all animate-[slideIn_.25s_ease-out] ${
              t.type === "success" ? "bg-[#2F6F4E] text-white" :
              t.type === "error" ? "bg-[#A23B3B] text-white" :
              "bg-ink text-cream"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
