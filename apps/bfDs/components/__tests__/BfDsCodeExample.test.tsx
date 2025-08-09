import { render } from "@bfmono/infra/testing/ui-testing.ts";
import { assert, assertEquals, assertExists } from "@std/assert";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

const sampleTypeScriptCode = `interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

console.log(greetUser(user));`;

const shortCode = `console.log("Hello, World!");`;

Deno.test("BfDsCodeExample renders with basic props", () => {
  const { doc } = render(
    <BfDsCodeExample code={shortCode} language="typescript" />,
  );

  const container = doc?.querySelector(".bfds-code-example");
  assertExists(container, "Code example container should exist");

  const languageLabel = doc?.querySelector(".bfds-code-example__language");
  assertExists(languageLabel, "Language label should exist");
  assertEquals(
    languageLabel?.textContent,
    "typescript",
    "Should display correct language",
  );

  const codeElement = doc?.querySelector("code");
  assertExists(codeElement, "Code element should exist");
  assertEquals(
    codeElement?.className,
    "language-typescript",
    "Should have correct language class",
  );
});

Deno.test("BfDsCodeExample applies syntax highlighting", () => {
  const { doc } = render(
    <BfDsCodeExample code="const x: number = 42;" language="typescript" />,
  );

  const codeContent = doc?.querySelector(".bfds-code-example__content-wrapper");
  assertExists(codeContent, "Code content wrapper should exist");

  const htmlContent = codeContent?.innerHTML || "";

  // Check that syntax highlighting tokens are present
  assert(
    htmlContent.includes('class="token'),
    "Should contain Prism.js token classes for syntax highlighting",
  );

  // Check for TypeScript-specific highlighting
  assert(
    htmlContent.includes("const") || htmlContent.includes("number"),
    "Should highlight TypeScript keywords and types",
  );
});

Deno.test("BfDsCodeExample shows expand button for long code", () => {
  const { doc } = render(
    <BfDsCodeExample
      code={sampleTypeScriptCode}
      language="typescript"
      collapsedLines={3}
    />,
  );

  // Should show expand button since code has more than 3 lines
  const expandButton = doc?.querySelector(
    ".bfds-code-example__header-buttons button[aria-expanded='false']",
  );
  assertExists(expandButton, "Expand button should exist for long code");

  const hiddenLinesButton = doc?.querySelector(
    ".bfds-code-example__hidden-lines button",
  );
  assertExists(hiddenLinesButton, "Hidden lines indicator should exist");

  const buttonText = hiddenLinesButton?.textContent || "";
  assert(
    buttonText.includes("more lines"),
    "Should show count of hidden lines",
  );
});

Deno.test("BfDsCodeExample does not show expand button for short code", () => {
  const { doc } = render(
    <BfDsCodeExample
      code={shortCode}
      language="typescript"
      collapsedLines={5}
    />,
  );

  // Should not show expand button since code has only 1 line
  const expandButton = doc?.querySelector(
    ".bfds-code-example__header-buttons button[aria-expanded]",
  );
  assertEquals(
    expandButton,
    null,
    "Expand button should not exist for short code",
  );

  const hiddenLinesButton = doc?.querySelector(
    ".bfds-code-example__hidden-lines",
  );
  assertEquals(
    hiddenLinesButton,
    null,
    "Hidden lines indicator should not exist",
  );

  const footer = doc?.querySelector(".bfds-code-example__footer");
  assertEquals(footer, null, "Footer should not exist for short code");
});

Deno.test("BfDsCodeExample renders with line numbers", () => {
  const multiLineCode = "line 1\nline 2\nline 3";
  const { doc } = render(
    <BfDsCodeExample
      code={multiLineCode}
      language="typescript"
      showLineNumbers
    />,
  );

  const lineNumbers = doc?.querySelectorAll(".bfds-code-example__line-number");
  assertEquals(
    lineNumbers?.length,
    3,
    "Should have line numbers for each line",
  );

  const firstLineNumber = lineNumbers?.[0];
  assertEquals(
    firstLineNumber?.textContent,
    "1",
    "First line should be numbered 1",
  );

  const thirdLineNumber = lineNumbers?.[2];
  assertEquals(
    thirdLineNumber?.textContent,
    "3",
    "Third line should be numbered 3",
  );
});

Deno.test("BfDsCodeExample renders without line numbers by default", () => {
  const { doc } = render(
    <BfDsCodeExample code="test code" language="typescript" />,
  );

  const lineNumbers = doc?.querySelectorAll(".bfds-code-example__line-number");
  assertEquals(
    lineNumbers?.length,
    0,
    "Should not have line numbers by default",
  );

  const contentWrapper = doc?.querySelector(
    ".bfds-code-example__content-wrapper",
  );
  assertExists(
    contentWrapper,
    "Should use content wrapper instead of line structure",
  );
});

Deno.test("BfDsCodeExample includes copy button", () => {
  const { doc } = render(
    <BfDsCodeExample code="test code" language="typescript" />,
  );

  const copyButton = doc?.querySelector(
    ".bfds-code-example__header-buttons .bfds-copy-button",
  );
  assertExists(copyButton, "Copy button should exist in header");
});

Deno.test("BfDsCodeExample respects custom props", () => {
  const { doc } = render(
    <BfDsCodeExample
      code={sampleTypeScriptCode}
      language="javascript"
      collapsedLines={2}
      className="custom-class"
      expandText="Show All"
      collapseText="Hide Some"
    />,
  );

  const container = doc?.querySelector(".bfds-code-example");
  assert(
    container?.className.includes("custom-class"),
    "Should include custom className",
  );

  const languageLabel = doc?.querySelector(".bfds-code-example__language");
  assertEquals(
    languageLabel?.textContent,
    "javascript",
    "Should use custom language",
  );

  const codeElement = doc?.querySelector("code");
  assertEquals(
    codeElement?.className,
    "language-javascript",
    "Should have correct language class",
  );
});

Deno.test("BfDsCodeExample handles empty code", () => {
  const { doc } = render(
    <BfDsCodeExample code="" language="typescript" />,
  );

  const container = doc?.querySelector(".bfds-code-example");
  assertExists(container, "Should render even with empty code");

  const codeElement = doc?.querySelector("code");
  assertExists(codeElement, "Code element should exist");
});

Deno.test("BfDsCodeExample supports different languages", () => {
  const pythonCode = "def hello():\n    print('Hello, World!')";

  const { doc } = render(
    <BfDsCodeExample code={pythonCode} language="python" />,
  );

  const languageLabel = doc?.querySelector(".bfds-code-example__language");
  assertEquals(
    languageLabel?.textContent,
    "python",
    "Should display Python language",
  );

  const codeElement = doc?.querySelector("code");
  assertEquals(
    codeElement?.className,
    "language-python",
    "Should have Python language class",
  );
});
