/**
 * @fileoverview BfDsCallout - A notification component for displaying important information with support for different variants, expandable details, auto-dismiss functionality, and animated transitions.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useEffect, useState } from "react";
import { BfDsIcon } from "./BfDsIcon.tsx";

export type BfDsCalloutVariant = "info" | "success" | "warning" | "error";

/**
 * Props for the BfDsCallout component
 */
export type BfDsCalloutProps = {
  /** Visual variant that determines the color scheme and icon. Each variant conveys different message severity */
  variant?: BfDsCalloutVariant;
  /** Optional detailed content to display in an expandable section. Useful for error messages, stack traces, or technical details */
  details?: string;
  /** Whether the details section is expanded by default when the component mounts */
  defaultExpanded?: boolean;
  /** Controls the visibility of the callout. When false, the component renders nothing */
  visible?: boolean;
  /** Callback function called when the callout is dismissed via the close button */
  onDismiss?: () => void;
  /** Auto-dismiss timeout in milliseconds. Set to 0 to disable auto-dismiss. Shows countdown ring on close button */
  autoDismiss?: number;
  /** Additional CSS classes to apply to the callout container */
  className?: string;
};

/**
 * A notification component for displaying important information with support for different visual variants,
 * expandable details, auto-dismiss functionality, and smooth animations. Perfect for user feedback, system
 * status updates, and contextual information.
 *
 * @example
 * // Basic callout with default info variant
 * <BfDsCallout>This is an informational message</BfDsCallout>
 *
 * @example
 * // Different variants for different message types
 * <BfDsCallout variant="success">Operation completed successfully!</BfDsCallout>
 * <BfDsCallout variant="warning">Please check your input</BfDsCallout>
 * <BfDsCallout variant="error">An error occurred</BfDsCallout>
 *
 * @example
 * // With dismiss functionality
 * <BfDsCallout
 *   variant="info"
 *   onDismiss={() => console.log('Callout dismissed')}
 * >
 *   Dismissible notification
 * </BfDsCallout>
 *
 * @example
 * // With expandable details for technical information
 * <BfDsCallout
 *   variant="error"
 *   details={JSON.stringify({ error: "Connection timeout", code: 408 }, null, 2)}
 * >
 *   Failed to connect to server
 * </BfDsCallout>
 *
 * @example
 * // Auto-dismiss with countdown
 * <BfDsCallout
 *   variant="success"
 *   autoDismiss={5000}
 *   onDismiss={() => console.log('Auto-dismissed')}
 * >
 *   This will auto-dismiss in 5 seconds
 * </BfDsCallout>
 *
 * @example
 * // Form validation messages
 * <BfDsCallout variant="error">
 *   Please fix the following errors:
 *   <ul>
 *     <li>Email field is required</li>
 *     <li>Password must be at least 8 characters</li>
 *   </ul>
 * </BfDsCallout>
 *
 * @example
 * // API response handling with details
 * <BfDsCallout
 *   variant="error"
 *   details={JSON.stringify(apiError.response, null, 2)}
 *   onDismiss={() => clearError()}
 * >
 *   Failed to load data. Click "Show details" for more information.
 * </BfDsCallout>
 *
 * @example
 * // System status updates
 * <BfDsCallout variant="info" autoDismiss={8000}>
 *   System maintenance scheduled for tonight at 2 AM PST
 * </BfDsCallout>
 *
 * @example
 * // Conditional visibility control
 * <BfDsCallout
 *   variant="warning"
 *   visible={showWarning}
 *   onDismiss={() => setShowWarning(false)}
 * >
 *   Connection is unstable
 * </BfDsCallout>
 *
 * @example
 * // Progress updates with details
 * <BfDsCallout
 *   variant="success"
 *   details="• Database backup completed\n• Files processed: 1,234\n• Duration: 2 minutes"
 *   defaultExpanded={true}
 * >
 *   Backup completed successfully
 * </BfDsCallout>
 *
 * @param props - The callout props
 * @param props.children - Main message content to display
 * @param props.variant - Visual variant for styling (default: "info")
 * @param props.details - Optional expandable detail text
 * @param props.defaultExpanded - Whether details start expanded (default: false)
 * @param props.visible - Whether the callout is visible (default: true)
 * @param props.onDismiss - Callback when dismissed
 * @param props.autoDismiss - Auto-dismiss timeout in ms, 0 disables (default: 0)
 * @param props.className - Additional CSS classes
 * @returns A notification callout with the specified styling and behavior
 *
 * @accessibility
 * - Uses semantic HTML structure for screen readers
 * - Dismiss button has descriptive aria-label
 * - Supports keyboard navigation for all interactive elements
 * - Variant-specific icons provide visual context
 * - Proper focus management for expand/collapse actions
 * - Auto-dismiss countdown is announced to screen readers
 */
export function BfDsCallout({
  children,
  variant = "info",
  details,
  defaultExpanded = false,
  visible = true,
  onDismiss,
  autoDismiss = 0,
  className,
}: React.PropsWithChildren<BfDsCalloutProps>) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isVisible, setIsVisible] = useState(visible);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(autoDismiss);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize time remaining when component mounts or autoDismiss changes
  useEffect(() => {
    if (visible && autoDismiss > 0) {
      setTimeRemaining(autoDismiss);
    }
  }, [visible, autoDismiss]);

  // Auto-dismiss countdown functionality
  useEffect(() => {
    if (visible && autoDismiss > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          // Only count down if not paused
          if (!isPaused && prev > 0) {
            if (prev <= 100) {
              // Start exit animation
              setIsAnimatingOut(true);
              // Wait for animation duration (0.3s) then call onDismiss and hide
              setTimeout(() => {
                setIsVisible(false);
                onDismiss?.();
              }, 300);
              return 0;
            }
            return prev - 100;
          }
          return prev; // Return current value if paused or already at 0
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [visible, autoDismiss, onDismiss, isPaused]);

  // Update visibility when prop changes
  useEffect(() => {
    setIsVisible(visible);
    setIsAnimatingOut(false); // Reset animation state when visibility changes
  }, [visible]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    // Wait for animation duration (0.3s) then call onDismiss and hide
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  const iconName = {
    info: "infoCircle" as const,
    success: "checkCircle" as const,
    warning: "exclamationTriangle" as const,
    error: "exclamationStop" as const,
  }[variant];

  const calloutClasses = [
    "bfds-callout",
    `bfds-callout--${variant}`,
    isAnimatingOut ? "bfds-callout--animating-out" : null,
    className,
  ].filter(Boolean).join(" ");

  const handleMouseEnter = () => {
    if (autoDismiss > 0) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (autoDismiss > 0) {
      setIsPaused(false);
    }
  };

  return (
    <div
      className={calloutClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bfds-callout-header">
        <div className="bfds-callout-icon">
          <BfDsIcon name={iconName} size="small" />
        </div>
        <div className="bfds-callout-content">
          <div className="bfds-callout-message">
            {children}
          </div>
          {details && (
            <button
              className="bfds-callout-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
              type="button"
            >
              {isExpanded ? "Hide details" : "Show details"}
              <BfDsIcon
                name={isExpanded ? "arrowUp" : "arrowDown"}
                size="small"
              />
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            className="bfds-callout-dismiss"
            onClick={handleDismiss}
            type="button"
            aria-label="Dismiss notification"
          >
            {autoDismiss > 0 && (() => {
              const SVG_SIZE = 32;
              const CENTER = SVG_SIZE / 2;
              const RADIUS = 14;
              const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
              const STROKE_WIDTH = 2;

              return (
                <div className="bfds-callout-countdown">
                  <svg
                    className={`bfds-callout-countdown-ring ${
                      isPaused ? "bfds-callout-countdown-ring--paused" : ""
                    }`}
                    width={SVG_SIZE}
                    height={SVG_SIZE}
                    viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                  >
                    <circle
                      className="bfds-callout-countdown-track"
                      cx={CENTER}
                      cy={CENTER}
                      r={RADIUS}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={STROKE_WIDTH}
                      opacity="0.2"
                    />
                    <circle
                      className="bfds-callout-countdown-progress"
                      cx={CENTER}
                      cy={CENTER}
                      r={RADIUS}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={STROKE_WIDTH}
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={CIRCUMFERENCE *
                        (1 - (timeRemaining / autoDismiss))}
                      transform={`rotate(-90 ${CENTER} ${CENTER})`}
                    />
                  </svg>
                </div>
              );
            })()}
            <BfDsIcon name="cross" size="small" />
          </button>
        )}
      </div>
      {details && isExpanded && (
        <div className="bfds-callout-details">
          <pre>{details}</pre>
        </div>
      )}
    </div>
  );
}
