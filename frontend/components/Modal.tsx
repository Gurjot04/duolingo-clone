"use client";
import { ReactNode, useEffect } from "react";

export default function Modal({ children, onClose, variant = "center" }: {
  children: ReactNode; onClose?: () => void; variant?: "center" | "sheet";
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal modal-${variant}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}
