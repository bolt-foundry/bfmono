/**
 * @fileoverview Simple TypeScript/TSX syntax highlighting utility for BfDsCodeExample
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */

// Import Prism for syntax highlighting
import Prism from "prismjs";
// Import language support (order matters - dependencies must be loaded first)
import "prismjs/components/prism-markup.js"; // Required for JSX
import "prismjs/components/prism-javascript.js"; // Required for JSX and TypeScript
import "prismjs/components/prism-typescript.js";
import "prismjs/components/prism-jsx.js"; // Requires markup + javascript
import "prismjs/components/prism-tsx.js"; // Requires jsx + typescript
import { getLogger } from "@bfmono/packages/logger/logger.ts";
const logger = getLogger(import.meta);

/**
 * Language mappings for common aliases to Prism language identifiers
 */
const LANGUAGE_MAP: Record<string, string> = {
  "ts": "typescript",
  "tsx": "tsx", // Use TSX highlighting for React TypeScript
  "js": "javascript",
  "jsx": "jsx", // Use JSX highlighting for React JavaScript
};

/**
 * Highlights TypeScript/TSX code using Prism.js syntax highlighting
 *
 * @param code - The code string to highlight
 * @param language - The programming language identifier (ts, tsx, js, jsx)
 * @returns HTML string with syntax highlighting markup
 *
 * @example
 * ```ts
 * const highlighted = highlightCode(
 *   'const greeting: string = "Hello World!";',
 *   'typescript'
 * );
 * // Returns: '<span class="token keyword">const</span> <span class="token variable">greeting</span>...'
 * ```
 */
export function highlightCode(code: string, language: string): string {
  try {
    // Normalize language identifier
    const normalizedLanguage = LANGUAGE_MAP[language] || language;

    // Check if the language is supported by Prism
    if (!Prism.languages[normalizedLanguage]) {
      // Return original code if language not supported - no fallback
      return escapeHtml(code);
    }

    // Highlight the code
    const highlighted = Prism.highlight(
      code,
      Prism.languages[normalizedLanguage],
      normalizedLanguage,
    );

    return highlighted;
  } catch (error) {
    // Return original code if highlighting fails
    logger.warn("Syntax highlighting failed:", error);
    return escapeHtml(code);
  }
}

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = globalThis.document?.createElement("div");
  if (div) {
    div.textContent = text;
    return div.innerHTML;
  }
  // Fallback for environments without document
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Checks if a language is supported for syntax highlighting
 *
 * @param language - The language identifier to check
 * @returns True if the language is supported
 */
export function isLanguageSupported(language: string): boolean {
  const normalizedLanguage = LANGUAGE_MAP[language] || language;
  return !!Prism.languages[normalizedLanguage] || !!Prism.languages.javascript;
}
