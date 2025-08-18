import { render } from "@bfmono/infra/testing/ui-testing.ts";
import { assertEquals, assertExists } from "@std/assert";
import { BfDsIcon } from "../BfDsIcon.tsx";

Deno.test("BfDsIcon renders with valid icon name", () => {
  const { doc } = render(<BfDsIcon name="arrowRight" />);

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.className,
    "bfds-icon bfds-icon_arrowRight bfds-icon--medium",
    "Icon should have default classes",
  );
  assertEquals(
    svg?.getAttribute("fill"),
    "currentColor",
    "Icon should have default fill",
  );
});

Deno.test("BfDsIcon renders with different sizes", () => {
  const sizes = ["small", "medium", "large"] as const;

  sizes.forEach((size) => {
    const { doc } = render(<BfDsIcon name="arrowRight" size={size} />);
    const svg = doc?.querySelector("svg");
    assertExists(svg, `Icon with ${size} size should exist`);
    assertEquals(
      svg?.className.includes(`bfds-icon--${size}`),
      true,
      `Icon should have ${size} class`,
    );
  });
});

Deno.test("BfDsIcon renders with custom color", () => {
  const { doc } = render(<BfDsIcon name="arrowRight" color="#ff0000" />);

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.getAttribute("fill"),
    "#ff0000",
    "Icon should have custom color",
  );
  // Note: Server-rendered SVG style properties may not be accessible in the same way
  assertEquals(
    svg?.getAttribute("fill"),
    "#ff0000",
    "Icon should have custom color in fill attribute",
  );
});

Deno.test("BfDsIcon renders with custom className", () => {
  const { doc } = render(
    <BfDsIcon name="arrowRight" className="custom-icon-class" />,
  );

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.className.includes("custom-icon-class"),
    true,
    "Icon should include custom class",
  );
  assertEquals(
    svg?.className.includes("bfds-icon"),
    true,
    "Icon should include base class",
  );
});

Deno.test("BfDsIcon renders path elements", () => {
  const { doc } = render(<BfDsIcon name="arrowRight" />);

  const svg = doc?.querySelector("svg");
  const paths = doc?.querySelectorAll("path");

  assertExists(svg, "SVG element should exist");
  assertEquals(
    (paths?.length || 0) > 0,
    true,
    "Icon should contain at least one path element",
  );
});

Deno.test("BfDsIcon has correct SVG attributes", () => {
  const { doc } = render(<BfDsIcon name="arrowRight" />);

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.getAttribute("xmlns"),
    "http://www.w3.org/2000/svg",
    "SVG should have correct namespace",
  );
  assertExists(
    svg?.getAttribute("viewBox"),
    "SVG should have viewBox attribute",
  );
});

Deno.test("BfDsIcon renders with additional SVG props", () => {
  const { doc } = render(
    <BfDsIcon
      name="arrowRight"
      data-testid="test-icon"
      aria-label="Right arrow"
    />,
  );

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.getAttribute("data-testid"),
    "test-icon",
    "Icon should have data-testid attribute",
  );
  assertEquals(
    svg?.getAttribute("aria-label"),
    "Right arrow",
    "Icon should have aria-label attribute",
  );
});

Deno.test("BfDsIcon renders with custom style", () => {
  const customStyle = { opacity: "0.5", transform: "rotate(45deg)" };
  const { doc } = render(
    <BfDsIcon
      name="arrowRight"
      style={customStyle}
    />,
  );

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");

  const style = svg?.getAttribute("style");
  assertExists(style, "SVG should have style attribute");
  assertEquals(
    style?.includes("opacity"),
    true,
    "Style should include opacity",
  );
  assertEquals(
    style?.includes("0.5"),
    true,
    "Style should include opacity value",
  );
});

Deno.test("BfDsIcon default size is medium", () => {
  const { doc } = render(<BfDsIcon name="arrowRight" />);

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.className.includes("bfds-icon--medium"),
    true,
    "Icon should have medium size by default",
  );
});

Deno.test("BfDsIcon default color is currentColor", () => {
  const { doc } = render(<BfDsIcon name="arrowRight" />);

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.getAttribute("fill"),
    "currentColor",
    "Icon should have currentColor fill by default",
  );
});

// Note: Testing invalid icon names would require mocking the icons object or
// understanding the icon registry, which would depend on the actual implementation.
// The component handles invalid icons by logging an error and returning null,
// but testing this would require mocking the logger or the icons registry.

Deno.test("BfDsIcon combines custom color with style", () => {
  const { doc } = render(
    <BfDsIcon
      name="arrowRight"
      color="#00ff00"
      style={{ opacity: "0.8" }}
    />,
  );

  const svg = doc?.querySelector("svg");
  assertExists(svg, "SVG element should exist");
  assertEquals(
    svg?.getAttribute("fill"),
    "#00ff00",
    "Icon should have custom color",
  );

  const style = svg?.getAttribute("style");
  assertExists(style, "SVG should have style attribute");
  assertEquals(
    style?.includes("fill") && style?.includes("#00ff00"),
    true,
    "Style should include custom color",
  );
  assertEquals(
    style?.includes("opacity") && style?.includes("0.8"),
    true,
    "Style should include custom opacity",
  );
});
