/**
 * @fileoverview BfDsProgressBar - A progress bar component for displaying completion status
 * @author Claude Code Assistant
 * @since 2.0.0
 */
import type * as React from "react";
import { useId } from "react";

/**
 * Size variants for the BfDsProgressBar component
 */
export type BfDsProgressBarSize = "small" | "medium" | "large";

/**
 * Visual states for the BfDsProgressBar component
 */
export type BfDsProgressBarState = "default" | "error" | "success" | "warning";

/**
 * Props for the BfDsProgressBar component
 */
export type BfDsProgressBarProps = {
  /** Current progress value (0-100) */
  value: number;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Label text displayed above progress bar */
  label?: string;
  /** Show value display */
  showValue?: boolean;
  /** Custom value formatter */
  formatValue?: (value: number) => string;
  /** Size variant */
  size?: BfDsProgressBarSize;
  /** Visual state of the progress bar */
  state?: BfDsProgressBarState;
  /** Custom color for the fill */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** Help text displayed below progress bar */
  helpText?: string;
  /** Element ID for the progress bar */
  id?: string;
};

/**
 * A progress bar component for displaying completion status and progress tracking
 *
 * BfDsProgressBar provides a visual representation of progress with customizable appearance.
 * Based on the BfDsRange component but simplified for read-only progress display. Perfect
 * for showing upload progress, task completion, loading states, and performance metrics.
 *
 * ## Key Features
 * - **Visual Progress Display**: Clean horizontal bar showing completion percentage
 * - **Custom Colors**: Support for custom fill colors and state-based styling
 * - **Flexible Value Display**: Show/hide values with custom formatting functions
 * - **Multiple States**: Default, error, success, and warning visual states
 * - **Three Size Variants**: Small, medium, and large sizes for different contexts
 * - **Accessibility First**: Proper ARIA attributes and semantic markup
 * - **Responsive Design**: Works seamlessly across different screen sizes
 *
 * ## Use Cases
 * - File upload/download progress
 * - Task completion tracking
 * - Performance metrics (accuracy, health scores)
 * - Loading states for long-running operations
 * - Workflow step completion
 * - Goal progress tracking
 *
 * @param props - Component props
 * @param props.value - Current progress value (defaults to 0-100 range)
 * @param props.min - Minimum value (default: 0)
 * @param props.max - Maximum value (default: 100)
 * @param props.label - Label text displayed above progress bar
 * @param props.showValue - Whether to show value display (default: true)
 * @param props.formatValue - Custom value formatter function (default: shows as percentage)
 * @param props.size - Size variant: "small" | "medium" | "large" (default: "medium")
 * @param props.state - Visual state: "default" | "error" | "success" | "warning" (default: "default")
 * @param props.color - Custom color for the progress fill (overrides state colors)
 * @param props.className - Additional CSS classes to apply
 * @param props.helpText - Help text displayed below progress bar
 * @param props.id - Element ID for the progress bar (auto-generated if not provided)
 *
 * @example
 * Basic upload progress:
 * ```tsx
 * <BfDsProgressBar
 *   label="Upload Progress"
 *   value={75}
 *   formatValue={(val) => `${val}%`}
 *   helpText="Uploading file..."
 * />
 * ```
 *
 * @example
 * Success state with custom formatting:
 * ```tsx
 * <BfDsProgressBar
 *   label="Health Score"
 *   value={85}
 *   state="success"
 *   formatValue={(val) => `${val}/100`}
 *   helpText="System health is excellent"
 * />
 * ```
 *
 * @example
 * Custom color and size for specific metrics:
 * ```tsx
 * <BfDsProgressBar
 *   label="Accuracy Rate"
 *   value={92.5}
 *   color="#10b981"
 *   size="small"
 *   formatValue={(val) => `${val.toFixed(1)}%`}
 * />
 * ```
 *
 * @example
 * Error state with custom range:
 * ```tsx
 * <BfDsProgressBar
 *   label="Disk Usage"
 *   value={450}
 *   min={0}
 *   max={500}
 *   state="error"
 *   formatValue={(val) => `${val}GB`}
 *   helpText="Disk space is critically low"
 * />
 * ```
 *
 * @returns A progress bar component for displaying completion status
 */
export function BfDsProgressBar({
  value,
  min = 0,
  max = 100,
  label,
  showValue = true,
  formatValue = (val) => `${val}%`,
  size = "medium",
  state = "default",
  color,
  className,
  helpText,
  id,
}: BfDsProgressBarProps) {
  const progressId = id || useId();
  const helpTextId = `${progressId}-help`;

  // Clamp value within min/max bounds
  const clampedValue = Math.min(Math.max(value, min), max);

  // Calculate percentage
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  const fillStyle = {
    left: "0%",
    width: `${percentage}%`,
    ...(color && { backgroundColor: color }),
  };

  const classes = [
    "bfds-progress-bar",
    `bfds-progress-bar--${size}`,
    `bfds-progress-bar--${state}`,
    className,
  ].filter(Boolean).join(" ");

  const containerClasses = [
    "bfds-progress-bar-container",
    `bfds-progress-bar-container--${state}`,
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      <div className="bfds-progress-bar-header">
        {label && (
          <label htmlFor={progressId} className="bfds-progress-bar-label">
            {label}
          </label>
        )}
        {showValue && (
          <div className="bfds-progress-bar-value">
            {formatValue(clampedValue)}
          </div>
        )}
      </div>
      <div className="bfds-progress-bar-wrapper">
        <div className="bfds-progress-bar-track">
          <div
            className="bfds-progress-bar-fill"
            style={fillStyle}
          />
        </div>
        <div
          id={progressId}
          role="progressbar"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          aria-valuetext={formatValue(clampedValue)}
          aria-describedby={helpText ? helpTextId : undefined}
          className={classes}
          style={{
            ...(color && {
              "--bfds-progress-bar-custom-color": color,
            } as React.CSSProperties),
          }}
        />
      </div>
      {helpText && (
        <div id={helpTextId} className="bfds-progress-bar-help">
          {helpText}
        </div>
      )}
    </div>
  );
}
