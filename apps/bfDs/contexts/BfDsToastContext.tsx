/**
 * @fileoverview BfDs Toast Context - Global toast notification system for the Bolt Foundry Design System
 *
 * This context provides a centralized toast notification system that can be used throughout
 * the application to display temporary messages, alerts, and notifications to users.
 *
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 * @see {@link BfDsToast} - Toast component for individual notifications
 * @see {@link BfDsProvider} - Main provider that includes toast functionality
 */

import type * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import { BfDsToastContainer } from "../components/BfDsToast.tsx";
import type { BfDsToastItem } from "../components/BfDsToast.tsx";
import type { BfDsCalloutVariant } from "../components/BfDsCallout.tsx";

/**
 * @typedef {Object} ToastOptions
 * @description Configuration options for displaying a toast notification
 * @property {BfDsCalloutVariant} [variant="info"] - Visual style variant (info, success, warning, error)
 * @property {string} [details] - Additional details text displayed below the main message
 * @property {number} [timeout=5000] - Auto-dismiss timeout in milliseconds (0 = no auto-dismiss)
 * @property {Function} [onDismiss] - Callback function called when toast is dismissed
 * @property {string} [id] - Custom ID for the toast (auto-generated if not provided)
 */

/**
 * @typedef {Object} ToastContextType
 * @description Shape of the toast context value providing toast management functionality
 * @property {Function} showToast - Function to display a new toast notification
 * @property {Function} hideToast - Function to hide a specific toast by ID
 * @property {Function} clearAllToasts - Function to remove all active toasts
 * @property {Array<BfDsToastItem>} toasts - Array of currently active toast items
 */
type ToastContextType = {
  /** Display a new toast notification and return its ID */
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
  /** Hide a specific toast by its ID */
  hideToast: (id: string) => void;
  /** Remove all currently active toasts */
  clearAllToasts: () => void;
  /** Array of all currently active toast items */
  toasts: Array<BfDsToastItem>;
};

/**
 * @private
 * @description Internal React context for toast notification system
 */
const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Custom hook to access the toast notification system from any component.
 *
 * This hook provides access to toast management functions including showing,
 * hiding, and clearing toast notifications. Must be used within a component
 * tree that includes BfDsToastProvider or BfDsProvider.
 *
 * @returns {ToastContextType} Toast management functions and state
 *
 * @throws {Error} When used outside of a BfDsToastProvider
 *
 * @example
 * // Basic toast usage
 * function MyComponent() {
 *   const { showToast } = useBfDsToast();
 *
 *   const handleSuccess = () => {
 *     showToast("Operation completed successfully!", {
 *       variant: "success",
 *       timeout: 3000
 *     });
 *   };
 *
 *   return <button onClick={handleSuccess}>Save</button>;
 * }
 *
 * @example
 * // Toast with details and custom dismiss handler
 * function MyComponent() {
 *   const { showToast, hideToast } = useBfDsToast();
 *
 *   const handleError = () => {
 *     const toastId = showToast("Upload failed", {
 *       variant: "error",
 *       details: "Please check your internet connection and try again.",
 *       timeout: 0, // No auto-dismiss
 *       onDismiss: () => console.log("Error toast dismissed")
 *     });
 *
 *     // Manually dismiss after user action
 *     setTimeout(() => hideToast(toastId), 10000);
 *   };
 * }
 *
 * @example
 * // Managing multiple toasts
 * function MyComponent() {
 *   const { showToast, clearAllToasts, toasts } = useBfDsToast();
 *
 *   const showMultipleToasts = () => {
 *     showToast("First notification", { variant: "info" });
 *     showToast("Second notification", { variant: "warning" });
 *     showToast("Third notification", { variant: "success" });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={showMultipleToasts}>Show Multiple</button>
 *       <button onClick={clearAllToasts}>Clear All ({toasts.length})</button>
 *     </div>
 *   );
 * }
 */
export function useBfDsToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useBfDsToast must be used within a BfDsToastProvider");
  }
  return context;
}

/**
 * Provider component that enables toast notifications throughout the application.
 *
 * This component sets up the toast notification system and should be placed high
 * in your component tree to make toast functionality available to all child components.
 * The provider manages toast state and renders the toast container.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to toast functionality
 *
 * @returns {React.ReactElement} Provider component with toast container
 *
 * @example
 * // Basic provider setup
 * function App() {
 *   return (
 *     <BfDsToastProvider>
 *       <MyApplicationComponents />
 *     </BfDsToastProvider>
 *   );
 * }
 *
 * @example
 * // Nested within other providers
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <BfDsToastProvider>
 *         <Router>
 *           <Routes>
 *             <Route path="/" element={<HomePage />} />
 *           </Routes>
 *         </Router>
 *       </BfDsToastProvider>
 *     </ThemeProvider>
 *   );
 * }
 *
 * @see {@link useBfDsToast} - Hook to access toast functionality
 * @see {@link BfDsProvider} - Main provider that includes toast functionality
 */
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
