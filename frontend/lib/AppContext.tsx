"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api, UserSummary } from "./api";

// ---------------------------------------------------------------- user state
interface UserCtx {
  user: UserSummary | null;
  error: string | null;
  refresh: () => Promise<void>;
  setUser: (u: UserSummary) => void;
}
const UserContext = createContext<UserCtx>({ user: null, error: null, refresh: async () => {}, setUser: () => {} });
export const useUser = () => useContext(UserContext);

// ---------------------------------------------------------------- toasts
type ToastKind = "info" | "success" | "error";
interface Toast { id: number; text: string; kind: ToastKind }
const ToastContext = createContext<(text: string, kind?: ToastKind) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function AppProviders({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const refresh = useCallback(async () => {
    try {
      setUser(await api.me());
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Cannot reach the server");
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000); // keeps heart regeneration timer fresh
    return () => clearInterval(t);
  }, [refresh]);

  const toast = useCallback((text: string, kind: ToastKind = "info") => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <UserContext.Provider value={{ user, error, refresh, setUser }}>
      <ToastContext.Provider value={toast}>
        {children}
        <div className="toast-stack" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.kind}`}>{t.text}</div>
          ))}
        </div>
      </ToastContext.Provider>
    </UserContext.Provider>
  );
}
