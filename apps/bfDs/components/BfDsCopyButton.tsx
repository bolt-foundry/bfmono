/**
 * @fileoverview BfDsCopyButton - A specialized button component for copying text to the clipboard with visual feedback, automatic state management, and accessibility features. Built on top of BfDsButton.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import * as React from "react";
import { BfDsButton, type BfDsButtonProps } from "./BfDsButton.tsx";
import { useCopyToClipboard } from "@bfmono/apps/boltFoundry/hooks/useCopyToClipboard.ts";

const { useState } = React;

/**
 * Props for the BfDsCopyButton component
 */
export type BfDsCopyButtonProps = {
  /** The text content to copy to the clipboard when the button is clicked */
  textToCopy: string;
  /** Text to display on the button when not in copied state */
  buttonText?: string;
  /** Text to display on the button when in copied state (temporary feedback) */
  copiedText?: string;
  /** Duration in milliseconds to show the copied state before reverting to normal state */
  copiedDuration?: number;
} & Omit<BfDsButtonProps, "onClick" | "children">;

/**
 * A specialized button component for copying text to the clipboard with built-in visual feedback and state management.
 * Automatically handles clipboard operations, success/failure states, and provides clear user feedback through icon
 * and text changes. Built on top of BfDsButton for consistent styling and behavior.
 *
 * @example
 * // Basic copy button (icon-only by default)
 * <BfDsCopyButton textToCopy="npm install @bolt-foundry/bolt-foundry" />
 *
 * @example
 * // With custom labels and full button text
 * <BfDsCopyButton
 *   textToCopy="Hello World!"
 *   buttonText="Copy Text"
 *   copiedText="Copied!"
 *   iconOnly={false}
 * />
 *
 * @example
 * // Copy command line instructions
 * <BfDsCopyButton
 *   textToCopy="aibff calibrate grader.deck.md"
 *   aria-label="Copy command"
 * />
 *
 * @example
 * // Copy API endpoints with custom styling
 * <BfDsCopyButton
 *   textToCopy="https://api.example.com/v1/users"
 *   variant="ghost"
 *   size="small"
 *   aria-label="Copy API endpoint"
 * />
 *
 * @example
 * // Copy code snippets with longer feedback duration
 * <BfDsCopyButton
 *   textToCopy={`const user = {
 *   name: "John Doe",
 *   email: "john@example.com"
 * };`}
 *   buttonText="Copy Code"
 *   copiedText="Code Copied!"
 *   copiedDuration={2000}
 *   iconOnly={false}
 * />
 *
 * @example
 * // Integration with code blocks
 * <div className="code-block">
 *   <code>aibff calibrate grader.deck.md</code>
 *   <BfDsCopyButton
 *     textToCopy="aibff calibrate grader.deck.md"
 *     aria-label="Copy command to clipboard"
 *   />
 * </div>
 *
 * @example
 * // Copy configuration values
 * <BfDsCopyButton
 *   textToCopy="sk_test_123456789"
 *   variant="ghost"
 *   size="small"
 *   aria-label="Copy API key"
 * />
 *
 * @example
 * // Copy multi-line content
 * <BfDsCopyButton
 *   textToCopy={JSON.stringify({
 *     "name": "Example Project",
 *     "version": "1.0.0",
 *     "dependencies": {
 *       "react": "^18.0.0"
 *     }
 *   }, null, 2)}
 *   buttonText="Copy JSON"
 *   iconOnly={false}
 * />
 *
 * @example
 * // In lists with multiple copy options
 * {commands.map((cmd) => (
 *   <div key={cmd.id} className="command-item">
 *     <code>{cmd.command}</code>
 *     <BfDsCopyButton
 *       textToCopy={cmd.command}
 *       aria-label={`Copy ${cmd.name} command`}
 *     />
 *   </div>
 * ))}
 *
 * @example
 * // Form integration for readonly values
 * <div className="form-field">
 *   <label>API Key</label>
 *   <div className="input-with-copy">
 *     <input value={apiKey} readOnly />
 *     <BfDsCopyButton
 *       textToCopy={apiKey}
 *       variant="outline"
 *       size="small"
 *     />
 *   </div>
 * </div>
 *
 * @param props - The copy button props
 * @param props.textToCopy - Text to copy to clipboard (required)
 * @param props.buttonText - Text when not copied (default: "Copy")
 * @param props.copiedText - Text when copied (default: "Copied!")
 * @param props.copiedDuration - Copied state duration in ms (default: 1000)
 * @param props.variant - Button variant (default: "outline")
 * @param props.icon - Icon when not copied (default: "clipboard")
 * @param props.iconOnly - Show only icon (default: true)
 * @returns A button that copies text to clipboard with visual feedback
 *
 * @accessibility
 * - Includes proper ARIA labels for screen readers
 * - Provides clear visual feedback through icon and text changes
 * - Supports full keyboard navigation
 * - Uses semantic HTML button element
 * - Icon changes provide visual confirmation of successful copy
 * - Always provide descriptive aria-label for icon-only buttons
 */
export function BfDsCopyButton({
  textToCopy,
  buttonText = "Copy",
  copiedText = "Copied!",
  copiedDuration = 1000,
  variant = "outline",
  icon = "clipboard",
  iconOnly = true,
  ...props
}: BfDsCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [, copy] = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copy(textToCopy);
    if (success) {
      setCopied(true);
      globalThis.setTimeout(() => setCopied(false), copiedDuration);
    }
  };

  const displayText = copied ? copiedText : buttonText;
  const displayIcon = copied ? "clipboardCheck" : icon;

  return (
    <BfDsButton
      {...props}
      variant={copied ? "primary" : variant}
      icon={displayIcon}
      iconOnly={iconOnly}
      onClick={handleCopy}
    >
      {!iconOnly && displayText}
    </BfDsButton>
  );
}
