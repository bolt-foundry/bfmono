import { render } from "@bfmono/infra/testing/ui-testing.ts";
import { assertEquals, assertExists } from "@std/assert";
import { BfDsCheckbox } from "../BfDsCheckbox.tsx";

Deno.test("BfDsCheckbox renders in standalone mode", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Accept terms"
      checked={false}
      onChange={() => {}}
    />,
  );

  const label = doc?.querySelector("label");
  const input = doc?.querySelector("input[type='checkbox']");
  const checkboxDiv = doc?.querySelector(".bfds-checkbox");
  const labelSpan = doc?.querySelector(".bfds-checkbox-label");

  assertExists(label, "Label wrapper should exist");
  assertExists(input, "Checkbox input should exist");
  assertExists(checkboxDiv, "Checkbox visual element should exist");
  assertExists(labelSpan, "Label text should exist");
  assertEquals(
    labelSpan?.textContent?.trim(),
    "Accept terms",
    "Label should display correct text",
  );
});

Deno.test("BfDsCheckbox renders in checked state", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Checked box"
      checked
      onChange={() => {}}
    />,
  );

  const input = doc?.querySelector(
    "input[type='checkbox']",
  ) as HTMLInputElement;
  const checkboxDiv = doc?.querySelector(".bfds-checkbox");
  const icon = doc?.querySelector(".bfds-checkbox-icon");

  assertExists(input, "Checkbox input should exist");
  assertEquals(input?.hasAttribute("checked"), true, "Input should be checked");
  assertEquals(
    checkboxDiv?.className?.includes("bfds-checkbox--checked"),
    true,
    "Checkbox should have checked class",
  );
  assertExists(icon, "Check icon should be visible when checked");
});

Deno.test("BfDsCheckbox renders in unchecked state", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Unchecked box"
      checked={false}
      onChange={() => {}}
    />,
  );

  const input = doc?.querySelector(
    "input[type='checkbox']",
  ) as HTMLInputElement;
  const checkboxDiv = doc?.querySelector(".bfds-checkbox");
  const icon = doc?.querySelector(".bfds-checkbox-icon");

  assertExists(input, "Checkbox input should exist");
  assertEquals(
    input?.hasAttribute("checked"),
    false,
    "Input should not be checked",
  );
  assertEquals(
    checkboxDiv?.className?.includes("bfds-checkbox--checked"),
    false,
    "Checkbox should not have checked class",
  );
  assertExists(icon, "Check icon element should exist");
  assertEquals(
    icon.classList.contains("bfds-checkbox-icon--hidden"),
    true,
    "Check icon should be hidden when unchecked",
  );
});

Deno.test("BfDsCheckbox renders in disabled state", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Disabled checkbox"
      disabled
      onChange={() => {}}
    />,
  );

  const input = doc?.querySelector(
    "input[type='checkbox']",
  ) as HTMLInputElement;
  const checkboxDiv = doc?.querySelector(".bfds-checkbox");

  assertExists(input, "Checkbox input should exist");
  assertEquals(
    input?.hasAttribute("disabled"),
    true,
    "Input should be disabled",
  );
  assertEquals(
    checkboxDiv?.className?.includes("bfds-checkbox--disabled"),
    true,
    "Checkbox should have disabled class",
  );
});

Deno.test("BfDsCheckbox renders with required attribute", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Required checkbox"
      required
      onChange={() => {}}
    />,
  );

  const input = doc?.querySelector(
    "input[type='checkbox']",
  ) as HTMLInputElement;
  const requiredSpan = doc?.querySelector(".bfds-checkbox-required");

  assertExists(input, "Checkbox input should exist");
  assertEquals(
    input?.hasAttribute("required"),
    true,
    "Input should be required",
  );
  assertExists(requiredSpan, "Required indicator should exist");
  assertEquals(
    requiredSpan?.textContent,
    "*",
    "Required indicator should show asterisk",
  );
});

Deno.test("BfDsCheckbox renders without label", () => {
  const { doc } = render(
    <BfDsCheckbox
      checked={false}
      onChange={() => {}}
    />,
  );

  const label = doc?.querySelector("label");
  const input = doc?.querySelector("input[type='checkbox']");
  const labelSpan = doc?.querySelector(".bfds-checkbox-label");

  assertExists(label, "Label wrapper should exist");
  assertExists(input, "Checkbox input should exist");
  assertEquals(
    labelSpan,
    null,
    "Label text should not exist when no label provided",
  );
});

Deno.test("BfDsCheckbox renders with custom className", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Custom class"
      className="custom-checkbox"
      checked={false}
      onChange={() => {}}
    />,
  );

  const checkboxDiv = doc?.querySelector(".bfds-checkbox");
  assertExists(checkboxDiv, "Checkbox should exist");
  assertEquals(
    checkboxDiv?.className?.includes("custom-checkbox"),
    true,
    "Checkbox should include custom class",
  );
});

Deno.test("BfDsCheckbox renders with custom id", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Custom ID"
      id="custom-checkbox-id"
      checked={false}
      onChange={() => {}}
    />,
  );

  const input = doc?.querySelector("input[type='checkbox']");
  assertExists(input, "Checkbox input should exist");
  assertEquals(input?.id, "custom-checkbox-id", "Input should have custom ID");
});

Deno.test("BfDsCheckbox renders with name attribute", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Named checkbox"
      name="test-checkbox"
      checked={false}
      onChange={() => {}}
    />,
  );

  const input = doc?.querySelector("input[type='checkbox']");
  assertExists(input, "Checkbox input should exist");
  assertEquals(
    input?.getAttribute("name"),
    "test-checkbox",
    "Input should have correct name attribute",
  );
});

Deno.test("BfDsCheckbox accessibility attributes", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Accessible checkbox"
      checked
      onChange={() => {}}
    />,
  );

  const checkboxDiv = doc?.querySelector(".bfds-checkbox");
  assertExists(checkboxDiv, "Checkbox visual element should exist");
  assertEquals(
    checkboxDiv?.getAttribute("role"),
    "checkbox",
    "Should have checkbox role",
  );
  assertEquals(
    checkboxDiv?.getAttribute("aria-checked"),
    "true",
    "Should have correct aria-checked value",
  );
  assertEquals(
    checkboxDiv?.getAttribute("tabIndex"),
    "0",
    "Should be focusable",
  );
});

Deno.test("BfDsCheckbox accessibility when disabled", () => {
  const { doc } = render(
    <BfDsCheckbox
      label="Disabled accessible checkbox"
      disabled
      checked={false}
      onChange={() => {}}
    />,
  );

  const checkboxDiv = doc?.querySelector(".bfds-checkbox");
  assertExists(checkboxDiv, "Checkbox visual element should exist");
  assertEquals(
    checkboxDiv?.getAttribute("tabIndex"),
    "-1",
    "Should not be focusable when disabled",
  );
});
