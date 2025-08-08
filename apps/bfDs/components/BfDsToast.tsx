/**
 * @fileoverview BfDsToast - A toast notification system built on top of BfDsCallout, providing temporary messages that appear in the corner of the screen. Toasts automatically disappear after a timeout and can include detailed information, custom callbacks, and visual feedback.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { BfDsCallout } from "./BfDsCallout.tsx";
import type { BfDsCalloutVariant } from "./BfDsCallout.tsx";

export const TOAST_TRANSITION_DURATION = 300;

/**
 * Configuration object for a single toast notification
 */
export type BfDsToastItem = {
  /** Unique identifier for the toast, used for tracking and removal */
  id: string;
  /** Main message content to display in the toast */
  message: React.ReactNode;
  /** Visual variant that determines the color scheme and icon (inherits from BfDsCallout) */
  variant?: BfDsCalloutVariant;
  /** Optional detailed information that can be expanded by the user */
  details?: string;
  /** Auto-dismiss timeout in milliseconds, 0 disables auto-dismiss */
  timeout?: number;
  /** Callback function called when the toast is dismissed */
  onDismiss?: () => void;
};

type BfDsToastProps = {
  toast: BfDsToastItem;
  onRemove: (id: string) => void;
  index: number;
};

function BfDsToastComponent({ toast, onRemove, index }: BfDsToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Show toast after a brief delay to allow for entrance animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    return () => {
      clearTimeout(showTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remove from DOM after animation completes
    setTimeout(() => {
      setShouldRender(false);
      onRemove(toast.id);
      toast.onDismiss?.();
    }, TOAST_TRANSITION_DURATION);
  };

  if (!shouldRender) return null;

  const toastClasses = [
    "bfds-toast",
    isVisible ? "bfds-toast--visible" : "bfds-toast--hidden",
  ].join(" ");

  return (
    <div
      className={toastClasses}
      style={{
        "--toast-index": index,
        "--toast-offset": `${index * 80}px`,
      } as React.CSSProperties}
    >
      <BfDsCallout
        variant={toast.variant}
        details={toast.details}
        visible
        onDismiss={handleDismiss}
        autoDismiss={toast.timeout || 0} // Pass timeout to callout for countdown display
      >
        {toast.message}
      </BfDsCallout>
    </div>
  );
}

type BfDsToastContainerProps = {
  toasts: Array<BfDsToastItem>;
  onRemove: (id: string) => void;
};

/**
 * Container component that renders multiple toast notifications using React portals.
 * This component is typically used internally by the toast system and should be rendered
 * at the application root level via BfDsProvider.
 *
 * @example
 * // Basic usage with toast provider
 * function App() {
 *   return (
 *     <BfDsProvider>
 *       <YourAppContent />
 *     </BfDsProvider>
 *   );
 * }
 *
 * @example
 * // Using toasts in components
 * function MyComponent() {
 *   const { showToast } = useBfDsToast();
 *
 *   return (
 *     <div>
 *       <button onClick={() => showToast("Hello World!")}>
 *         Show Toast
 *       </button>
 *       <button onClick={() => showToast("Success!", { variant: "success" })}>
 *         Show Success
 *       </button>
 *       <button onClick={() => showToast("Error occurred", {
 *         variant: "error",
 *         timeout: 0,
 *         details: "Stack trace details here..."
 *       })}>
 *         Show Error with Details
 *       </button>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Form submission with toast feedback
 * const handleSubmit = async (data) => {
 *   const loadingToastId = showToast("Submitting...", {
 *     variant: "info",
 *     timeout: 0,
 *   });
 *
 *   try {
 *     await submitForm(data);
 *     hideToast(loadingToastId);
 *     showToast("Form submitted successfully!", {
 *       variant: "success",
 *       timeout: 3000,
 *     });
 *   } catch (error) {
 *     hideToast(loadingToastId);
 *     showToast("Failed to submit form", {
 *       variant: "error",
 *       details: error.message,
 *       timeout: 0,
 *     });
 *   }
 * };
 *
 * @example
 * // Connection status monitoring
 * useEffect(() => {
 *   const handleOnline = () => {
 *     showToast("Connection restored", {
 *       variant: "success",
 *       timeout: 3000,
 *     });
 *   };
 *
 *   const handleOffline = () => {
 *     showToast("Connection lost", {
 *       variant: "warning",
 *       timeout: 0, // Keep visible until connection restored
 *     });
 *   };
 *
 *   window.addEventListener("online", handleOnline);
 *   window.addEventListener("offline", handleOffline);
 *
 *   return () => {
 *     window.removeEventListener("online", handleOnline);
 *     window.removeEventListener("offline", handleOffline);
 *   };
 * }, [showToast]);
 *
 * @param props - The toast container props
 * @param props.toasts - Array of toast items to display
 * @param props.onRemove - Function to remove a toast by ID
 * @returns Portal-rendered toast notifications or null if no toast root element
 *
 * @accessibility
 * - Toast content is announced to screen readers when displayed
 * - Proper ARIA labeling for dismiss buttons
 * - Keyboard accessible (focus management and navigation)
 * - Visual indicators with countdown rings
 * - Semantic structure for assistive technologies
 */
export function BfDsToastContainer(
  { toasts, onRemove }: BfDsToastContainerProps,
) {
  const toastRoot = globalThis.document?.getElementById("toast-root");

  if (!toastRoot) {
    // Toast root element not found - this is expected during SSR or if toast-root div is missing
    return null;
  }

  return createPortal(
    <div className="bfds-toast-container">
      {toasts.map((toast, index) => (
        <BfDsToastComponent
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          index={index}
        />
      ))}
    </div>,
    toastRoot,
  );
}
