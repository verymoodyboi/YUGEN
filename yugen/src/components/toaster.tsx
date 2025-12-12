// src/components/toaster.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { FiCheckCircle, FiXCircle, FiAlertTriangle } from "react-icons/fi";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warn";
  exiting?: boolean;
}

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = Date.now();

    // Add toast in "entering" state
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Trigger exit animation before removal
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
    }, 2800); // Exit starts 0.4s before removal

    // Remove after exit animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const toastAPI = {
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    warn: (msg: string) => addToast(msg, "warn"),
  };

  return (
    <ToastContext.Provider value={toastAPI}>
      {children}

      {/* Toast container: top-center */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 space-y-3 z-[9999]">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            message={t.message}
            type={t.type}
            exiting={t.exiting}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const ToastItem = ({
  message,
  type,
  exiting,
}: {
  message: string;
  type: "success" | "error" | "warn";
  exiting?: boolean;
}) => {
  // Icon per type
  const icon =
    type === "success" ? (
      <FiCheckCircle className="inline-block mr-2 text-emerald-50" />
    ) : type === "error" ? (
      <FiXCircle className="inline-block mr-2 text-red-500" />
    ) : (
      <FiAlertTriangle className="inline-block mr-2 text-yellow-500" />
    );

  // Shadow/tint per type
  const tint =
    type === "success"
      ? "shadow-[0_0_0_2px_rgba(16,185,129,0.6)]"
      : type === "error"
        ? "shadow-[0_0_0_2px_rgba(220,38,38,0.6)]"
        : "shadow-[0_0_0_2px_rgba(234,179,8,0.6)]";

  return (
    <div
      className={`
    flex items-center px-4 py-2 rounded-xl border-2 border-emerald-50
    bg-emerald-950 text-emerald-50 font-bold shadow-md ${tint}
    subtext

    ${
      exiting
        ? "opacity-0 -translate-y-2 scale-95 transition-all duration-300 ease-in"
        : "animate-[toast-enter_0.25s_ease-out]"
    }
  `}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};
