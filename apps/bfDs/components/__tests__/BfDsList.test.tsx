import { render } from "@bfmono/infra/testing/ui-testing.ts";
import { assertEquals, assertExists } from "@std/assert";
import { BfDsList } from "../BfDsList.tsx";
import { BfDsListItem } from "../BfDsListItem.tsx";

Deno.test("BfDsList renders with default classes", () => {
  const { doc } = render(
    <BfDsList>
      <li>Item 1</li>
      <li>Item 2</li>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  assertExists(list, "List element should exist");
  assertEquals(list?.className, "bfds-list", "List should have default class");
});

Deno.test("BfDsList renders with custom className", () => {
  const { doc } = render(
    <BfDsList className="custom-list-class">
      <li>Item 1</li>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  assertExists(list, "List element should exist");
  assertEquals(
    list?.className.includes("custom-list-class"),
    true,
    "List should include custom class",
  );
  assertEquals(
    list?.className.includes("bfds-list"),
    true,
    "List should include base class",
  );
});

Deno.test("BfDsList renders children correctly", () => {
  const { doc } = render(
    <BfDsList>
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  const items = doc?.querySelectorAll("li");

  assertExists(list, "List element should exist");
  assertEquals(items?.length, 3, "List should contain three items");
  assertEquals(
    items?.[0]?.textContent,
    "First item",
    "First item should have correct content",
  );
  assertEquals(
    items?.[1]?.textContent,
    "Second item",
    "Second item should have correct content",
  );
  assertEquals(
    items?.[2]?.textContent,
    "Third item",
    "Third item should have correct content",
  );
});

Deno.test("BfDsList renders with complex children", () => {
  const { doc } = render(
    <BfDsList>
      <li>
        <span>Complex item</span>
        <button type="button">Action</button>
      </li>
      <li>
        <div>
          <h3>Title</h3>
          <p>Description</p>
        </div>
      </li>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  const spans = doc?.querySelectorAll("span");
  const buttons = doc?.querySelectorAll("button");
  const h3s = doc?.querySelectorAll("h3");
  const paragraphs = doc?.querySelectorAll("p");

  assertExists(list, "List element should exist");
  assertEquals(spans?.length, 1, "Should contain one span");
  assertEquals(buttons?.length, 1, "Should contain one button");
  assertEquals(h3s?.length, 1, "Should contain one h3");
  assertEquals(paragraphs?.length, 1, "Should contain one paragraph");
});

Deno.test("BfDsList renders empty list", () => {
  const { doc } = render(<BfDsList>{null}</BfDsList>);

  const list = doc?.querySelector("ul");
  assertExists(list, "List element should exist");
  assertEquals(list?.children?.length, 0, "Empty list should have no children");
});

Deno.test("BfDsList renders with single child", () => {
  const { doc } = render(
    <BfDsList>
      <li>Only item</li>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  const items = doc?.querySelectorAll("li");

  assertExists(list, "List element should exist");
  assertEquals(items?.length, 1, "List should contain one item");
  assertEquals(
    items?.[0]?.textContent,
    "Only item",
    "Item should have correct content",
  );
});

Deno.test("BfDsList renders with mixed content types", () => {
  const { doc } = render(
    <BfDsList>
      <li>Regular item</li>
      <div>Not a list item</div>
      <li>Another regular item</li>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  const listItems = doc?.querySelectorAll("li");
  const divs = doc?.querySelectorAll("div");

  assertExists(list, "List element should exist");
  assertEquals(listItems?.length, 2, "List should contain two li elements");
  assertEquals(
    divs?.length,
    2,
    "List should contain two div elements (container + child)",
  );
});

Deno.test("BfDsList preserves child element attributes", () => {
  const { doc } = render(
    <BfDsList>
      <li className="special-item" data-testid="first-item">
        Special item
      </li>
      <li id="second-item">
        Second item
      </li>
    </BfDsList>,
  );

  const firstItem = doc?.querySelector("[data-testid='first-item']");
  const secondItem = doc?.querySelector("#second-item");

  assertExists(firstItem, "First item should exist");
  assertExists(secondItem, "Second item should exist");
  assertEquals(
    firstItem?.className,
    "special-item",
    "First item should preserve className",
  );
  assertEquals(secondItem?.id, "second-item", "Second item should preserve id");
});

Deno.test("BfDsList handles null/undefined children gracefully", () => {
  const { doc } = render(
    <BfDsList>
      <li>Valid item</li>
      {null}
      {undefined}
      <li>Another valid item</li>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  const items = doc?.querySelectorAll("li");

  assertExists(list, "List element should exist");
  assertEquals(items?.length, 2, "List should contain only valid items");
  assertEquals(
    items?.[0]?.textContent,
    "Valid item",
    "First item should have correct content",
  );
  assertEquals(
    items?.[1]?.textContent,
    "Another valid item",
    "Second item should have correct content",
  );
});

Deno.test("BfDsList className filtering", () => {
  const { doc } = render(<BfDsList className="">Test</BfDsList>);

  const list = doc?.querySelector("ul");
  assertExists(list, "List element should exist");
  assertEquals(
    list?.className,
    "bfds-list",
    "Empty className should be filtered out, only base class remains",
  );
});

Deno.test("BfDsList accordion mode adds accordion class", () => {
  const { doc } = render(
    <BfDsList accordion>
      <BfDsListItem>Item 1</BfDsListItem>
      <BfDsListItem>Item 2</BfDsListItem>
    </BfDsList>,
  );

  const list = doc?.querySelector("ul");
  assertExists(list, "List element should exist");
  assertEquals(
    list?.className.includes("bfds-list--accordion"),
    true,
    "Accordion list should have accordion class",
  );
});

Deno.test("BfDsListItem renders expandable content", () => {
  const { doc } = render(
    <BfDsList>
      <BfDsListItem expandContents={<div>Expanded content</div>}>
        Main content
      </BfDsListItem>
    </BfDsList>,
  );

  const listItem = doc?.querySelector(".bfds-list-item");
  const expandableClasses = listItem?.className.includes(
    "bfds-list-item--expandable",
  );
  const icon = doc?.querySelector(".bfds-icon");

  assertExists(listItem, "List item should exist");
  assertEquals(
    expandableClasses,
    true,
    "List item should have expandable class",
  );
  assertExists(icon, "Arrow icon should exist");
});

Deno.test("BfDsListItem without expandContents is not expandable", () => {
  const { doc } = render(
    <BfDsList>
      <BfDsListItem>
        Main content only
      </BfDsListItem>
    </BfDsList>,
  );

  const listItem = doc?.querySelector(".bfds-list-item");
  const expandableClasses = listItem?.className.includes(
    "bfds-list-item--expandable",
  );
  const icon = doc?.querySelector(".bfds-icon");

  assertExists(listItem, "List item should exist");
  assertEquals(
    expandableClasses,
    false,
    "List item should not have expandable class",
  );
  assertEquals(icon, null, "Arrow icon should not exist");
});
