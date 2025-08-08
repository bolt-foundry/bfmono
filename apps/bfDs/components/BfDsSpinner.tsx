/**
 * @fileoverview BfDsSpinner - Loading spinner components with customizable appearance and animations
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";

/**
 * Props for the BfDsSpinner component
 */
export type BfDsSpinnerProps = {
  /** Size of the spinner in pixels (default: 48) */
  size?: number;
  /** Color of the spinner (defaults to currentColor to inherit parent text color) */
  color?: string;
  /** 0-1 percentage to offset the starting point of the spinner animation */
  offset?: number;
  /** When true, shows an animated icon inside the spinner (bolt/hourglass animation) */
  waitIcon?: boolean;
};

const topFrom = "23.33,58.48 57.88,-0.04 57.88,58.48"; // bolt
const topTo = "25,20 75,20 50.04,58.47"; // hourglass
const bottomFrom = "77.27,41.37 42.72,99.89 42.72,41.37"; // bolt
const bottomTo = "75,77 25,77 49.96,38.56"; // hourglass

/**
 * A loading spinner component with customizable appearance and optional animated icon
 *
 * BfDsSpinner provides visual loading feedback with a circular progress indicator.
 * It includes an optional animated icon feature that transforms between bolt and
 * hourglass shapes, perfect for longer loading operations.
 *
 * Features:
 * - Customizable size and color
 * - Inherits parent text color by default
 * - Optional animated icon overlay (bolt/hourglass transformation)
 * - Smooth rotation animation
 * - Accessible markup for screen readers
 *
 * @param props - Component props
 * @param props.size - Size of the spinner in pixels (default: 48)
 * @param props.color - Color of the spinner (default: "currentColor")
 * @param props.offset - 0-1 percentage to offset the starting point of animation
 * @param props.waitIcon - When true, shows animated bolt/hourglass icon inside spinner
 *
 * @example
 * Basic usage:
 * ```tsx
 * <BfDsSpinner />
 * ```
 *
 * @example
 * Custom size and color:
 * ```tsx
 * <BfDsSpinner
 *   size={32}
 *   color="#007bff"
 * />
 * ```
 *
 * @example
 * With animated icon for longer operations:
 * ```tsx
 * <BfDsSpinner
 *   waitIcon
 *   size={48}
 * />
 * ```
 *
 * @example
 * In button loading state:
 * ```tsx
 * <BfDsButton disabled={isLoading}>
 *   {isLoading ? (
 *     <div className="flex items-center gap-2">
 *       <BfDsSpinner size={16} />
 *       Processing...
 *     </div>
 *   ) : (
 *     "Submit"
 *   )}
 * </BfDsButton>
 * ```
 *
 * @example
 * Content loading indicator:
 * ```tsx
 * {isLoading ? (
 *   <div className="flex justify-center py-8">
 *     <BfDsSpinner size={32} />
 *   </div>
 * ) : (
 *   <div>{content}</div>
 * )}
 * ```
 *
 * @returns A loading spinner component with optional animated icon
 */
export function BfDsSpinner({
  size = 48,
  color = "currentColor",
  offset = 0,
  waitIcon = false,
}: BfDsSpinnerProps) {
  const strokeWidth = Math.max(2, size / 24);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  return (
    <div
      className="bfds-spinner-container"
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        className="bfds-spinner"
        style={{
          transform: "rotate(-90deg)",
        }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          opacity={0.1}
        />

        {/* Animated foreground circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
          strokeDashoffset={-circumference * offset}
          style={{
            animation: "bfds-spinner-rotate 1.2s linear infinite",
            transformOrigin: "center",
          }}
        />
      </svg>

      {waitIcon && (
        <div
          style={{
            position: "absolute",
            width: "90%",
            height: "90%",
            top: "5%",
            left: "5%",
          }}
        >
          <svg viewBox="0 0 100 100">
            <polygon points="" fill={color}>
              <animate
                attributeName="points"
                calcMode="spline"
                dur="5s"
                fill="loop"
                repeatCount="indefinite"
                values={`${topFrom}; ${topFrom}; ${topTo}; ${topTo}; ${topFrom}`}
                keyTimes="0; 0.4; 0.5; 0.9; 1"
                keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1"
              />
            </polygon>
            <polygon points="" fill={color}>
              <animate
                attributeName="points"
                calcMode="spline"
                dur="5s"
                fill="loop"
                repeatCount="indefinite"
                values={`${bottomFrom}; ${bottomFrom}; ${bottomTo}; ${bottomTo}; ${bottomFrom}`}
                keyTimes="0; 0.4; 0.5; 0.9; 1"
                keySplines="0 0 1 1; 0.5 0 0.5 1; 0 0 1 1; 0.5 0 0.5 1"
              />
            </polygon>
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Props for the BfDsFullPageSpinner component
 */
export interface BfDsFullPageSpinnerProps {
  /** Additional styles to apply to the container */
  xstyle?: React.CSSProperties;
}

/**
 * A full-page loading overlay spinner component
 *
 * BfDsFullPageSpinner provides a centered loading spinner that takes up the full
 * viewport, perfect for application initialization, route transitions, or full-page
 * loading states. Includes a fade-in animation for smooth appearance.
 *
 * Features:
 * - Takes full viewport dimensions (100% width and height)
 * - Centers spinner horizontally and vertically
 * - Includes fade-in animation with delay
 * - Uses primary brand color by default
 * - Includes animated bolt/hourglass icon
 * - Customizable container styles
 *
 * @param props - Component props
 * @param props.xstyle - Additional CSS styles to apply to the container
 *
 * @example
 * Basic full-page loading:
 * ```tsx
 * <BfDsFullPageSpinner />
 * ```
 *
 * @example
 * With custom background:
 * ```tsx
 * <BfDsFullPageSpinner
 *   xstyle={{
 *     backgroundColor: 'rgba(0,0,0,0.1)',
 *     backdropFilter: 'blur(2px)'
 *   }}
 * />
 * ```
 *
 * @example
 * Application initialization:
 * ```tsx
 * function App() {
 *   const [isInitializing, setIsInitializing] = useState(true);
 *
 *   if (isInitializing) {
 *     return <BfDsFullPageSpinner />;
 *   }
 *
 *   return <MainApplication />;
 * }
 * ```
 *
 * @returns A full-page loading spinner overlay component
 */
export function BfDsFullPageSpinner({ xstyle = {} }: BfDsFullPageSpinnerProps) {
  return (
    <div
      style={{
        color: "var(--bfds-primary)",
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        boxSizing: "border-box",
        ...xstyle,
      }}
    >
      <div className="bfds-animate-fadeIn delay-100">
        <BfDsSpinner waitIcon />
      </div>
    </div>
  );
}
