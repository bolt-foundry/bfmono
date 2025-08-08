/**
 * @fileoverview BfDsCodeExample - Collapsible code example component with syntax highlighting and expand/collapse functionality
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import { useState } from "react";
import { BfDsButton } from "./BfDsButton.tsx";
import { BfDsCopyButton } from "./BfDsCopyButton.tsx";
import { BfDsIcon } from "./BfDsIcon.tsx";
import { highlightCode } from "../lib/syntaxHighlighter.ts";

/**
 * Props for the BfDsCodeExample component.
 */
export type BfDsCodeExampleProps = {
  /** Code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Number of lines to show when collapsed */
  collapsedLines?: number;
  /** Custom CSS classes */
  className?: string;
  /** Show line numbers */
  showLineNumbers?: boolean;
  /** Custom expand button text */
  expandText?: string;
  /** Custom collapse button text */
  collapseText?: string;
};

/**
 * A collapsible code example component that shows a limited number of lines by default
 * and can be expanded to show the full code block. Perfect for documentation examples
 * and JSDoc code blocks.
 *
 * Features:
 * - Configurable collapsed line count (default: 5)
 * - Smooth expand/collapse animations
 * - Optional line numbers
 * - Syntax highlighting support
 * - Copy-to-clipboard functionality
 * - Accessible keyboard navigation
 *
 * @param code - The code content to display
 * @param language - Programming language for syntax highlighting (e.g., "tsx", "typescript", "javascript")
 * @param collapsedLines - Number of lines to show when collapsed (default: 5)
 * @param className - Additional CSS classes
 * @param showLineNumbers - Whether to display line numbers (default: false)
 * @param expandText - Custom text for expand button (default: "Show more")
 * @param collapseText - Custom text for collapse button (default: "Show less")
 *
 * @returns React component that renders a collapsible code block
 *
 * @example
 * // Basic collapsible code example
 * <BfDsCodeExample
 *   language="tsx"
 *   code={`import { BfDsButton } from "@bfmono/bfDs";
 *
 * function MyComponent() {
 *   const handleClick = () => {
 *     console.log("Button clicked!");
 *   };
 *
 *   return (
 *     <div>
 *       <BfDsButton variant="primary" onClick={handleClick}>
 *         Click me
 *       </BfDsButton>
 *       <BfDsButton variant="secondary">
 *         Secondary action
 *       </BfDsButton>
 *     </div>
 *   );
 * }`}
 * />
 *
 * @example
 * // Code example with line numbers and custom collapse behavior
 * <BfDsCodeExample
 *   language="typescript"
 *   code={longCodeString}
 *   collapsedLines={3}
 *   showLineNumbers={true}
 *   expandText="View full example"
 *   collapseText="Hide details"
 * />
 *
 * @example
 * // Short code that won't show expand button
 * <BfDsCodeExample
 *   language="jsx"
 *   code={`<BfDsButton>Simple button</BfDsButton>`}
 * />
 *
 * @example
 * // API response example
 * <BfDsCodeExample
 *   language="json"
 *   code={JSON.stringify(apiResponse, null, 2)}
 *   collapsedLines={8}
 *   showLineNumbers={true}
 * />
 *
 * @example
 * // Configuration example with custom styling
 * <BfDsCodeExample
 *   language="yaml"
 *   code={configYaml}
 *   className="custom-config-display"
 *   collapsedLines={6}
 * />
 */
export function BfDsCodeExample({
  code,
  language = "typescript",
  collapsedLines = 5,
  className,
  showLineNumbers = false,
  expandText = "Show more",
  collapseText = "Show less",
}: BfDsCodeExampleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split code into lines
  const lines = code.split("\n");
  const totalLines = lines.length;
  const shouldShowExpandButton = totalLines > collapsedLines;

  // Determine which lines to show
  const visibleLines = isExpanded ? lines : lines.slice(0, collapsedLines);

  // Get highlighted code
  const visibleCode = visibleLines.join("\n");
  const highlightedCode = highlightCode(visibleCode, language);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const containerClasses = [
    "bfds-code-example",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      <div className="bfds-code-example__header">
        <span className="bfds-code-example__language">
          {language}
        </span>
        <div className="bfds-code-example__header-buttons">
          <BfDsCopyButton
            textToCopy={code}
            variant="ghost"
            size="small"
          />
          {shouldShowExpandButton && (
            <BfDsButton
              variant="ghost"
              size="small"
              icon={isExpanded ? "chevronUp" : "chevronDown"}
              iconOnly
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse code" : "Expand code"}
            />
          )}
        </div>
      </div>

      <div className="bfds-code-example__content">
        <pre className="bfds-code-example__pre">
          <code className={`language-${language}`}>
            {showLineNumbers ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: highlightedCode.split('\n').map((line, index) =>
                    `<div class="bfds-code-example__line">
                      <span class="bfds-code-example__line-number">${index + 1}</span>
                      <span class="bfds-code-example__line-content">${line || '\u00A0'}</span>
                    </div>`
                  ).join('')
                }}
              />
            ) : (
              <div
                className="bfds-code-example__content-wrapper"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            )}
          </code>
        </pre>

        {shouldShowExpandButton && !isExpanded && (
          <div className="bfds-code-example__fade">
            <div className="bfds-code-example__fade-gradient" />
            <div className="bfds-code-example__hidden-lines">
              <BfDsButton
                variant="ghost"
                size="small"
                onClick={toggleExpanded}
                aria-label={`Show ${
                  totalLines - collapsedLines
                } more lines of code`}
              >
                {totalLines - collapsedLines} more lines...
              </BfDsButton>
            </div>
          </div>
        )}
      </div>

      {shouldShowExpandButton && (
        <button
          type="button"
          className="bfds-code-example__footer"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-controls="code-content"
          aria-label={isExpanded ? collapseText : expandText}
        >
          <BfDsIcon
            name={isExpanded ? "arrowUp" : "arrowDown"}
            size="small"
            className="bfds-code-example__footer-icon"
          />
          <span className="bfds-code-example__footer-text">
            {isExpanded ? collapseText : expandText}
            {!isExpanded && ` (${totalLines - collapsedLines} more lines)`}
          </span>
        </button>
      )}
    </div>
  );
}
