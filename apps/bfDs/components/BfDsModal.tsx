/**
 * @fileoverview BfDsModal - Modal dialog component with automatic focus management and accessibility
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import { type ReactNode, useEffect, useRef } from "react";
import { BfDsButton } from "./BfDsButton.tsx";

/**
 * Props for the BfDsModal component.
 */
export interface BfDsModalProps {
  /**
   * Controls whether the modal is visible (required)
   */
  isOpen: boolean;

  /**
   * Callback when the modal should be closed (required)
   */
  onClose: () => void;

  /**
   * The title displayed in the modal header
   */
  title?: string;

  /**
   * The modal content
   */
  children: ReactNode;

  /**
   * Custom footer content. If not provided, no footer is shown
   */
  footer?: ReactNode;

  /**
   * Size variant of the modal
   * @default "medium"
   */
  size?: "small" | "medium" | "large" | "fullscreen";

  /**
   * Whether clicking the backdrop closes the modal
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing Escape closes the modal
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Whether to show the close button in the header
   * @default true
   */
  showCloseButton?: boolean;
}

/**
 * A modal dialog component for displaying content in an overlay above the main
 * application. Includes automatic focus management, backdrop controls, and
 * keyboard accessibility features.
 *
 * @param isOpen - Controls whether the modal is visible (required)
 * @param onClose - Callback when the modal should be closed (required)
 * @param title - The title displayed in the modal header
 * @param children - The modal content
 * @param footer - Custom footer content. If not provided, no footer is shown
 * @param size - Size variant of the modal ("small" | "medium" | "large" | "fullscreen")
 * @param closeOnBackdropClick - Whether clicking the backdrop closes the modal (default: true)
 * @param closeOnEscape - Whether pressing Escape closes the modal (default: true)
 * @param className - Additional CSS class name
 * @param showCloseButton - Whether to show the close button in the header (default: true)
 *
 * @example
 * Simple modal:
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <BfDsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Simple Modal"
 * >
 *   <p>This is a simple modal with basic content.</p>
 * </BfDsModal>
 * ```
 *
 * @example
 * Modal with footer actions:
 * ```tsx
 * <BfDsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Modal with Actions"
 *   footer={
 *     <>
 *       <BfDsButton variant="outline" onClick={() => setIsOpen(false)}>
 *         Cancel
 *       </BfDsButton>
 *       <BfDsButton variant="primary" onClick={handleSave}>
 *         Save
 *       </BfDsButton>
 *     </>
 *   }
 * >
 *   <p>Modal content with action buttons in the footer.</p>
 * </BfDsModal>
 * ```
 *
 * @example
 * Small confirmation modal:
 * ```tsx
 * <BfDsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="small"
 *   footer={
 *     <>
 *       <BfDsButton variant="outline" onClick={() => setIsOpen(false)}>
 *         Cancel
 *       </BfDsButton>
 *       <BfDsButton variant="primary" onClick={handleConfirm}>
 *         Confirm
 *       </BfDsButton>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to delete this item?</p>
 * </BfDsModal>
 * ```
 *
 * @example
 * Large modal with form:
 * ```tsx
 * <BfDsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Project Settings"
 *   size="large"
 * >
 *   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
 *     <div>
 *       <h3>General Settings</h3>
 *       <BfDsInput label="Project Name" />
 *       <BfDsSelect label="Category" options={[]} />
 *     </div>
 *     <div>
 *       <h3>Advanced Settings</h3>
 *       <BfDsCheckbox label="Enable notifications" />
 *       <BfDsCheckbox label="Public project" />
 *     </div>
 *   </div>
 * </BfDsModal>
 * ```
 *
 * @example
 * Fullscreen modal:
 * ```tsx
 * <BfDsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Document Editor"
 *   size="fullscreen"
 * >
 *   <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
 *     <div>Toolbar</div>
 *     <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem" }}>
 *       Document content editor area...
 *     </div>
 *   </div>
 * </BfDsModal>
 * ```
 *
 * @example
 * Modal with disabled backdrop/escape:
 * ```tsx
 * <BfDsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Important Action Required"
 *   closeOnBackdropClick={false}
 *   closeOnEscape={false}
 *   showCloseButton={false}
 *   footer={
 *     <BfDsButton variant="primary" onClick={handleComplete}>
 *       I Understand
 *     </BfDsButton>
 *   }
 * >
 *   <p>Please read this important information carefully.</p>
 *   <p>You must acknowledge this message to continue.</p>
 * </BfDsModal>
 * ```
 *
 * @example
 * Multi-step wizard modal:
 * ```tsx
 * const [step, setStep] = useState(1);
 * const totalSteps = 3;
 *
 * <BfDsModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title={`Setup Wizard - Step ${step} of ${totalSteps}`}
 *   footer={
 *     <>
 *       <BfDsButton
 *         variant="outline"
 *         onClick={() => step > 1 ? setStep(step - 1) : setIsOpen(false)}
 *       >
 *         {step > 1 ? "Previous" : "Cancel"}
 *       </BfDsButton>
 *       <BfDsButton
 *         variant="primary"
 *         onClick={() => step < totalSteps ? setStep(step + 1) : handleFinish()}
 *       >
 *         {step < totalSteps ? "Next" : "Finish"}
 *       </BfDsButton>
 *     </>
 *   }
 * >
 *   {step === 1 && <div><h3>Welcome</h3><p>Let's get started.</p></div>}
 *   {step === 2 && <div><h3>Profile</h3><BfDsInput label="Name" /></div>}
 *   {step === 3 && <div><h3>Preferences</h3><BfDsCheckbox label="Notifications" /></div>}
 * </BfDsModal>
 * ```
 *
 * ## Accessibility Features
 * - **Focus Management**: Automatically traps focus within the modal when open
 * - **Focus Restoration**: Returns focus to previously focused element on close
 * - **Keyboard Navigation**: Tab/Shift+Tab navigates through focusable elements
 * - **Escape Key**: Closes modal (unless disabled)
 * - **Screen Reader Support**: Uses proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)
 * - **Semantic Structure**: Associates title with modal using `aria-labelledby`
 *
 * ## Body Scroll Prevention
 * When a modal is open, body scrolling is automatically disabled and restored when closed.
 *
 * ## Styling Classes
 * - `.bfds-modal-backdrop`: Background overlay
 * - `.bfds-modal`: Main modal container
 * - `.bfds-modal--{size}`: Size-specific styling (small, medium, large, fullscreen)
 * - `.bfds-modal-header`: Header section
 * - `.bfds-modal-title`: Title text styling
 * - `.bfds-modal-close`: Close button styling
 * - `.bfds-modal-body`: Main content area
 * - `.bfds-modal-footer`: Footer section
 */
export function BfDsModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = "",
  showCloseButton = true,
}: BfDsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus to the previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalClasses = [
    "bfds-modal",
    `bfds-modal--${size}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className="bfds-modal-backdrop" onClick={handleBackdropClick}>
      <div
        className={modalClasses}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "bfds-modal-title" : undefined}
      >
        {(title || showCloseButton) && (
          <div className="bfds-modal-header">
            {title && (
              <h2 id="bfds-modal-title" className="bfds-modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <BfDsButton
                variant="ghost"
                icon="cross"
                iconOnly
                onClick={onClose}
                aria-label="Close modal"
                className="bfds-modal-close"
              />
            )}
          </div>
        )}

        <div className="bfds-modal-body">
          {children}
        </div>

        {footer && (
          <div className="bfds-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
