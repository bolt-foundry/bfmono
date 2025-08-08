import type * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { BfDsToastContainer } from "../components/BfDsToast.tsx";
import type { BfDsToastItem } from "../components/BfDsToast.tsx";
import type { BfDsCalloutVariant } from "../components/BfDsCallout.tsx";

type ToastContextType = {
  showToast: (
    message: React.ReactNode,
    options?: {
      variant?: BfDsCalloutVariant;
      details?: string;
      timeout?: number;
      onDismiss?: () => void;
      id?: string;
    },
  ) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  toasts: Array<BfDsToastItem>;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useBfDsToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useBfDsToast must be used within a BfDsToastProvider");
  }
  return context;
}

export function BfDsToastProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = useState<Array<BfDsToastItem>>([]);

  const showToast = useCallback((
    message: React.ReactNode,
    options: {
      variant?: BfDsCalloutVariant;
      details?: string;
      timeout?: number;
      onDismiss?: () => void;
      id?: string;
    } = {},
  ) => {
    const id = options.id ||
      `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newToast: BfDsToastItem = {
      id,
      message,
      variant: options.variant || "info",
      details: options.details,
      timeout: options.timeout !== undefined ? options.timeout : 5000, // Default 5 second timeout, but allow 0
      onDismiss: options.onDismiss,
    };

    setToasts((prev) => {
      // If toast with same ID exists, replace it
      const filtered = prev.filter((t) => t.id !== id);
      // Add new toast to the end (bottom of stack)
      return [...filtered, newToast];
    });

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    clearAllToasts,
    toasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <BfDsToastContainer toasts={toasts} onRemove={hideToast} />
    </ToastContext.Provider>
  );
}
