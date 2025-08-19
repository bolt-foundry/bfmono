import type * as _React from "react";
import { render } from "@bfmono/infra/testing/ui-testing.ts";
import { assertEquals, assertExists } from "@std/assert";
import { BfDsProgressBar } from "../BfDsProgressBar.tsx";

Deno.test("BfDsProgressBar - renders with label", () => {
  const { getByText } = render(
    <BfDsProgressBar label="Test Progress" value={50} />,
  );
  const label = getByText("Test Progress");
  assertExists(label);
});

Deno.test("BfDsProgressBar - renders with correct ARIA attributes", () => {
  const { doc } = render(
    <BfDsProgressBar
      min={10}
      max={90}
      value={45}
      label="Test Progress"
    />,
  );
  const progressBar = doc?.querySelector('[role="progressbar"]');
  assertExists(progressBar);
  assertEquals(progressBar?.getAttribute("role"), "progressbar");
  assertEquals(progressBar?.getAttribute("aria-valuemin"), "10");
  assertEquals(progressBar?.getAttribute("aria-valuemax"), "90");
  assertEquals(progressBar?.getAttribute("aria-valuenow"), "45");
  assertEquals(progressBar?.getAttribute("aria-valuetext"), "45%");
});

Deno.test("BfDsProgressBar - applies custom formatter to value display and ARIA", () => {
  const { getByText, doc } = render(
    <BfDsProgressBar
      value={0.75}
      min={0}
      max={1}
      formatValue={(val) => `${Math.round(val * 100)}%`}
    />,
  );

  // Check value display
  const valueDisplay = getByText("75%");
  assertExists(valueDisplay);

  // Check ARIA valuetext
  const progressBar = doc?.querySelector('[role="progressbar"]');
  assertEquals(progressBar?.getAttribute("aria-valuetext"), "75%");
});

Deno.test("BfDsProgressBar - renders different sizes", () => {
  const { doc: small } = render(<BfDsProgressBar size="small" value={50} />);
  const { doc: medium } = render(<BfDsProgressBar size="medium" value={50} />);
  const { doc: large } = render(<BfDsProgressBar size="large" value={50} />);

  assertExists(small?.querySelector(".bfds-progress-bar--small"));
  assertExists(medium?.querySelector(".bfds-progress-bar--medium"));
  assertExists(large?.querySelector(".bfds-progress-bar--large"));
});

Deno.test("BfDsProgressBar - renders different states", () => {
  const { doc: defaultState } = render(
    <BfDsProgressBar state="default" value={50} />,
  );
  const { doc: error } = render(<BfDsProgressBar state="error" value={50} />);
  const { doc: success } = render(
    <BfDsProgressBar state="success" value={50} />,
  );
  const { doc: warning } = render(
    <BfDsProgressBar state="warning" value={50} />,
  );

  assertExists(defaultState?.querySelector(".bfds-progress-bar--default"));
  assertExists(error?.querySelector(".bfds-progress-bar--error"));
  assertExists(success?.querySelector(".bfds-progress-bar--success"));
  assertExists(warning?.querySelector(".bfds-progress-bar--warning"));
});

Deno.test("BfDsProgressBar - displays help text", () => {
  const { getByText } = render(
    <BfDsProgressBar helpText="This shows progress" value={30} />,
  );
  const helpText = getByText("This shows progress");
  assertExists(helpText);
});

Deno.test("BfDsProgressBar - hides value display when showValue is false", () => {
  const { doc } = render(<BfDsProgressBar showValue={false} value={75} />);
  const valueDisplay = doc?.querySelector(".bfds-progress-bar-value");
  assertEquals(valueDisplay, null);
});

Deno.test("BfDsProgressBar - shows value display by default", () => {
  const { doc } = render(<BfDsProgressBar value={75} />);
  const valueDisplay = doc?.querySelector(".bfds-progress-bar-value");
  assertExists(valueDisplay);
  assertEquals(valueDisplay?.textContent, "75%");
});

Deno.test("BfDsProgressBar - renders with custom color style", () => {
  const { doc } = render(<BfDsProgressBar color="#ff0000" value={50} />);
  const progressBar = doc?.querySelector('[role="progressbar"]');
  const fill = doc?.querySelector(".bfds-progress-bar-fill");

  assertExists(progressBar);
  assertExists(fill);

  // Check that custom color CSS variable is set on progress bar
  const progressBarStyle = progressBar?.getAttribute("style");
  assertExists(progressBarStyle);
  assertEquals(
    progressBarStyle.includes("--bfds-progress-bar-custom-color:#ff0000"),
    true,
  );

  // Check that fill has custom background color in style attribute
  const fillStyle = fill?.getAttribute("style");
  assertExists(fillStyle);
  assertEquals(fillStyle.includes("background-color:#ff0000"), true);
});

Deno.test("BfDsProgressBar - calculates correct percentage for fill width", () => {
  const { doc } = render(<BfDsProgressBar value={25} min={0} max={100} />);
  const fill = doc?.querySelector(".bfds-progress-bar-fill");
  assertExists(fill);

  const fillStyle = fill?.getAttribute("style");
  assertExists(fillStyle);
  assertEquals(fillStyle.includes("width:25%"), true);
});

Deno.test("BfDsProgressBar - calculates correct percentage for custom range", () => {
  const { doc } = render(<BfDsProgressBar value={150} min={100} max={200} />);
  const fill = doc?.querySelector(".bfds-progress-bar-fill");
  assertExists(fill);

  const fillStyle = fill?.getAttribute("style");
  assertExists(fillStyle);
  // 150 is 50% between 100 and 200
  assertEquals(fillStyle.includes("width:50%"), true);
});

Deno.test("BfDsProgressBar - clamps value within min/max bounds", () => {
  // Test value above max
  const { doc: above } = render(
    <BfDsProgressBar value={150} min={0} max={100} />,
  );
  const progressBarAbove = above?.querySelector('[role="progressbar"]');
  assertEquals(progressBarAbove?.getAttribute("aria-valuenow"), "100");

  // Test value below min
  const { doc: below } = render(
    <BfDsProgressBar value={-10} min={0} max={100} />,
  );
  const progressBarBelow = below?.querySelector('[role="progressbar"]');
  assertEquals(progressBarBelow?.getAttribute("aria-valuenow"), "0");
});

Deno.test("BfDsProgressBar - handles zero progress correctly", () => {
  const { doc } = render(<BfDsProgressBar value={0} min={0} max={100} />);
  const fill = doc?.querySelector(".bfds-progress-bar-fill");
  assertExists(fill);

  const fillStyle = fill?.getAttribute("style");
  assertExists(fillStyle);
  assertEquals(fillStyle.includes("width:0%"), true);
});

Deno.test("BfDsProgressBar - handles complete progress correctly", () => {
  const { doc } = render(<BfDsProgressBar value={100} min={0} max={100} />);
  const fill = doc?.querySelector(".bfds-progress-bar-fill");
  assertExists(fill);

  const fillStyle = fill?.getAttribute("style");
  assertExists(fillStyle);
  assertEquals(fillStyle.includes("width:100%"), true);
});

Deno.test("BfDsProgressBar - handles decimal values correctly", () => {
  const { doc } = render(<BfDsProgressBar value={33.5} min={0} max={100} />);
  const progressBar = doc?.querySelector('[role="progressbar"]');
  const fill = doc?.querySelector(".bfds-progress-bar-fill");

  assertEquals(progressBar?.getAttribute("aria-valuenow"), "33.5");

  assertExists(fill);
  const fillStyle = fill?.getAttribute("style");
  assertExists(fillStyle);
  assertEquals(fillStyle.includes("width:33.5%"), true);
});

Deno.test("BfDsProgressBar - generates unique ID when not provided", () => {
  const { doc: first } = render(<BfDsProgressBar value={50} />);
  const { doc: second } = render(<BfDsProgressBar value={50} />);

  const firstProgressBar = first?.querySelector('[role="progressbar"]');
  const secondProgressBar = second?.querySelector('[role="progressbar"]');

  assertExists(firstProgressBar);
  assertExists(secondProgressBar);

  const firstId = firstProgressBar?.getAttribute("id");
  const secondId = secondProgressBar?.getAttribute("id");

  assertExists(firstId);
  assertExists(secondId);
  assertEquals(firstId !== secondId, true);
});

Deno.test("BfDsProgressBar - uses provided ID", () => {
  const { doc } = render(<BfDsProgressBar value={50} id="custom-progress" />);
  const progressBar = doc?.querySelector('[role="progressbar"]');

  assertEquals(progressBar?.getAttribute("id"), "custom-progress");
});

Deno.test("BfDsProgressBar - associates label with progress bar using htmlFor", () => {
  const { doc } = render(
    <BfDsProgressBar label="Test Progress" value={50} id="test-progress" />,
  );
  const label = doc?.querySelector("label");
  const progressBar = doc?.querySelector('[role="progressbar"]');

  assertExists(label);
  assertExists(progressBar);
  assertEquals(label?.getAttribute("for"), "test-progress");
  assertEquals(progressBar?.getAttribute("id"), "test-progress");
});

Deno.test("BfDsProgressBar - associates help text with progress bar using aria-describedby", () => {
  const { doc } = render(
    <BfDsProgressBar
      value={50}
      helpText="Progress information"
      id="test-progress"
    />,
  );

  const progressBar = doc?.querySelector('[role="progressbar"]');
  const helpText = doc?.querySelector(".bfds-progress-bar-help");

  assertExists(progressBar);
  assertExists(helpText);
  assertEquals(helpText?.getAttribute("id"), "test-progress-help");
  assertEquals(
    progressBar?.getAttribute("aria-describedby"),
    "test-progress-help",
  );
});

Deno.test("BfDsProgressBar - applies custom className", () => {
  const { doc } = render(
    <BfDsProgressBar value={50} className="custom-class" />,
  );
  const progressBar = doc?.querySelector('[role="progressbar"]');

  assertExists(progressBar);
  assertEquals(progressBar?.className.includes("custom-class"), true);
});

Deno.test("BfDsProgressBar - renders proper DOM structure", () => {
  const { doc } = render(
    <BfDsProgressBar
      label="Test Progress"
      value={75}
      helpText="Help information"
    />,
  );

  // Check container
  const container = doc?.querySelector(".bfds-progress-bar-container");
  assertExists(container);

  // Check header with label and value
  const header = doc?.querySelector(".bfds-progress-bar-header");
  assertExists(header);

  const label = doc?.querySelector(".bfds-progress-bar-label");
  assertExists(label);

  const value = doc?.querySelector(".bfds-progress-bar-value");
  assertExists(value);

  // Check wrapper and track
  const wrapper = doc?.querySelector(".bfds-progress-bar-wrapper");
  assertExists(wrapper);

  const track = doc?.querySelector(".bfds-progress-bar-track");
  assertExists(track);

  // Check fill
  const fill = doc?.querySelector(".bfds-progress-bar-fill");
  assertExists(fill);

  // Check progress bar element
  const progressBar = doc?.querySelector('[role="progressbar"]');
  assertExists(progressBar);

  // Check help text
  const helpText = doc?.querySelector(".bfds-progress-bar-help");
  assertExists(helpText);
});

Deno.test("BfDsProgressBar - uses default formatValue when not provided", () => {
  const { doc } = render(<BfDsProgressBar value={42} />);
  const valueDisplay = doc?.querySelector(".bfds-progress-bar-value");
  const progressBar = doc?.querySelector('[role="progressbar"]');

  assertEquals(valueDisplay?.textContent, "42%");
  assertEquals(progressBar?.getAttribute("aria-valuetext"), "42%");
});

Deno.test("BfDsProgressBar - handles negative ranges correctly", () => {
  const { doc } = render(<BfDsProgressBar value={-25} min={-100} max={100} />);
  const progressBar = doc?.querySelector('[role="progressbar"]');
  const fill = doc?.querySelector(".bfds-progress-bar-fill");

  assertEquals(progressBar?.getAttribute("aria-valuenow"), "-25");

  assertExists(fill);
  const fillStyle = fill?.getAttribute("style");
  assertExists(fillStyle);
  // -25 is 37.5% between -100 and 100
  assertEquals(fillStyle.includes("width:37.5%"), true);
});

Deno.test("BfDsProgressBar - applies container state classes", () => {
  const { doc: error } = render(<BfDsProgressBar state="error" value={50} />);
  const { doc: success } = render(
    <BfDsProgressBar state="success" value={50} />,
  );

  const errorContainer = error?.querySelector(".bfds-progress-bar-container");
  const successContainer = success?.querySelector(
    ".bfds-progress-bar-container",
  );

  assertExists(errorContainer);
  assertExists(successContainer);
  assertEquals(
    errorContainer?.className.includes("bfds-progress-bar-container--error"),
    true,
  );
  assertEquals(
    successContainer?.className.includes(
      "bfds-progress-bar-container--success",
    ),
    true,
  );
});
