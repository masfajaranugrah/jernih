"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (options: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx;
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const styles: Record<ToastType, { wrapper: string; icon: string; progress: string }> = {
  success: {
    wrapper: "bg-white border-l-4 border-[#064e3b]",
    icon: "text-[#064e3b] bg-[#064e3b]/10",
    progress: "bg-[#064e3b]",
  },
  error: {
    wrapper: "bg-white border-l-4 border-[#ba1a1a]",
    icon: "text-[#ba1a1a] bg-[#ba1a1a]/10",
    progress: "bg-[#ba1a1a]",
  },
  warning: {
    wrapper: "bg-white border-l-4 border-[#b45309]",
    icon: "text-[#b45309] bg-[#b45309]/10",
    progress: "bg-[#b45309]",
  },
  info: {
    wrapper: "bg-white border-l-4 border-[#1d4ed8]",
    icon: "text-[#1d4ed8] bg-[#1d4ed8]/10",
    progress: "bg-[#1d4ed8]",
  },
};

// ── Single Toast Item ─────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const s = styles[toast.type];
  return (
    <div
      className={`relative flex items-start gap-3 w-80 rounded-xl shadow-lg px-4 py-3.5 overflow-hidden animate-in slide-in-from-right-5 fade-in duration-300 ${s.wrapper}`}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${s.icon}`}>
        {icons[toast.type]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-[#191c1d] leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-[#707974] leading-relaxed">{toast.message}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-[#bfc9c3] hover:text-[#404944] transition-colors mt-0.5"
        aria-label="Tutup notifikasi"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${s.progress}`}
        style={{ animation: "toast-shrink 4s linear forwards" }}
      />
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((options: Omit<Toast, "id">) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { ...options, id }]); // max 5 toast
    const timer = setTimeout(() => remove(id), 4000);
    timers.current.set(id, timer);
  }, [remove]);

  const success = useCallback((title: string, message?: string) => toast({ type: "success", title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: "error",   title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: "info",    title, message }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: "warning", title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      {/* Container — pojok kanan bawah */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
