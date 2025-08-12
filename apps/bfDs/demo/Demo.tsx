import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { BfDsList } from "../components/BfDsList.tsx";
import { BfDsListItem } from "../components/BfDsListItem.tsx";
import { BfDsButtonExample } from "../components/__examples__/BfDsButton.example.tsx";
import { BfDsIconExample } from "../components/__examples__/BfDsIcon.example.tsx";
import { BfDsTabsExample } from "../components/__examples__/BfDsTabs.example.tsx";
import { BfDsFormExample } from "../components/__examples__/BfDsForm.example.tsx";
import { BfDsInputExample } from "../components/__examples__/BfDsInput.example.tsx";
import { BfDsTextAreaExample } from "../components/__examples__/BfDsTextArea.example.tsx";
import { BfDsFormSubmitButtonExample } from "../components/__examples__/BfDsFormSubmitButton.example.tsx";
import { BfDsListExample } from "../components/__examples__/BfDsList.example.tsx";
import { BfDsListItemExample } from "../components/__examples__/BfDsListItem.example.tsx";
import { BfDsSelectExample } from "../components/__examples__/BfDsSelect.example.tsx";
import { BfDsCheckboxExample } from "../components/__examples__/BfDsCheckbox.example.tsx";
import { BfDsRadioExample } from "../components/__examples__/BfDsRadio.example.tsx";
import { BfDsToggleExample } from "../components/__examples__/BfDsToggle.example.tsx";
import { BfDsCalloutExample } from "../components/__examples__/BfDsCallout.example.tsx";
import { BfDsToastExample } from "../components/__examples__/BfDsToast.example.tsx";
import { BfDsPillExample } from "../components/__examples__/BfDsPill.example.tsx";
import { BfDsSpinnerExample } from "../components/__examples__/BfDsSpinner.example.tsx";
import { BfDsRangeExample } from "../components/__examples__/BfDsRange.example.tsx";
import { BfDsModalExample } from "../components/__examples__/BfDsModal.example.tsx";
import { BfDsEmptyStateExample } from "../components/__examples__/BfDsEmptyState.example.tsx";
import { BfDsCardExample } from "../components/__examples__/BfDsCard.example.tsx";
import { BfDsBadgeExample } from "../components/__examples__/BfDsBadge.example.tsx";
import { BfDsListBarExample } from "../components/__examples__/BfDsListBar.example.tsx";
import { BfDsCodeExampleBasic } from "../components/__examples__/BfDsCodeExample.example.tsx";
import { BfDsHudExample } from "@bfmono/apps/bfDs/components/__examples__/BfDsHud.example.tsx";
import { DefaultPricingTable } from "../components/__examples__/BfDsPricingTable.example.tsx";

type ComponentSection = {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  category: "Core" | "Form" | "Navigation" | "Advanced";
};

const componentSections: Array<ComponentSection> = [
  {
    id: "button",
    name: "Button",
    description: "Interactive buttons with variants, sizes, and icon support",
    component: BfDsButtonExample,
    category: "Core",
  },
  {
    id: "icon",
    name: "Icon",
    description: "SVG icons with customizable sizes and colors",
    component: BfDsIconExample,
    category: "Core",
  },
  {
    id: "tabs",
    name: "Tabs",
    description: "Tab navigation with nested subtabs and keyboard support",
    component: BfDsTabsExample,
    category: "Navigation",
  },
  {
    id: "form",
    name: "Form",
    description: "Complete form system with context and validation",
    component: BfDsFormExample,
    category: "Form",
  },
  {
    id: "input",
    name: "Input",
    description: "Text inputs with states and dual-mode operation",
    component: BfDsInputExample,
    category: "Form",
  },
  {
    id: "textarea",
    name: "TextArea",
    description: "Multi-line text inputs with resize options",
    component: BfDsTextAreaExample,
    category: "Form",
  },
  {
    id: "submit-button",
    name: "Submit button",
    description: "Form submission buttons with automatic integration",
    component: BfDsFormSubmitButtonExample,
    category: "Form",
  },
  {
    id: "list",
    name: "List",
    description: "Simple, clean lists with navigation patterns",
    component: BfDsListExample,
    category: "Navigation",
  },
  {
    id: "list-item",
    name: "List item",
    description: "Individual list items with states and interactions",
    component: BfDsListItemExample,
    category: "Navigation",
  },
  {
    id: "list-bar",
    name: "List bar",
    description: "Horizontal bars with left, center, and right sections",
    component: BfDsListBarExample,
    category: "Navigation",
  },
  {
    id: "select",
    name: "Select",
    description: "Dropdown selectors with form integration",
    component: BfDsSelectExample,
    category: "Form",
  },
  {
    id: "checkbox",
    name: "Checkbox",
    description: "Checkboxes with form integration and accessibility",
    component: BfDsCheckboxExample,
    category: "Form",
  },
  {
    id: "radio",
    name: "Radio",
    description: "Radio button groups with flexible layouts",
    component: BfDsRadioExample,
    category: "Form",
  },
  {
    id: "toggle",
    name: "Toggle",
    description: "Toggle switches with smooth animations and sizes",
    component: BfDsToggleExample,
    category: "Form",
  },
  {
    id: "range",
    name: "Range",
    description:
      "Range sliders with value display, ticks, and custom formatting",
    component: BfDsRangeExample,
    category: "Form",
  },
  {
    id: "callout",
    name: "Callout",
    description: "Notification system with variants and auto-dismiss",
    component: BfDsCalloutExample,
    category: "Core",
  },
  {
    id: "toast",
    name: "Toast",
    description: "Portal-based toast notifications in bottom-right corner",
    component: BfDsToastExample,
    category: "Core",
  },
  {
    id: "pill",
    name: "Pill",
    description: "Compact pill components with labels, icons, and actions",
    component: BfDsPillExample,
    category: "Core",
  },
  {
    id: "spinner",
    name: "Spinner",
    description: "Loading spinners with customizable sizes and colors",
    component: BfDsSpinnerExample,
    category: "Core",
  },
  {
    id: "modal",
    name: "Modal",
    description: "Overlay dialogs for forms, confirmations, and content",
    component: BfDsModalExample,
    category: "Core",
  },
  {
    id: "empty-state",
    name: "Empty state",
    description: "Display when there's no data or content to show",
    component: BfDsEmptyStateExample,
    category: "Core",
  },
  {
    id: "card",
    name: "Card",
    description: "Container for content with variants and interactive states",
    component: BfDsCardExample,
    category: "Core",
  },
  {
    id: "badge",
    name: "Badge",
    description: "Small status indicators and labels with variants and actions",
    component: BfDsBadgeExample,
    category: "Core",
  },
  {
    id: "code-example",
    name: "Code example",
    description:
      "Collapsible code blocks with syntax highlighting and copy functionality",
    component: BfDsCodeExampleBasic,
    category: "Core",
  },
  {
    id: "hud",
    name: "HUD (Heads-Up Display)",
    description: "Floating console with action buttons and message history",
    component: BfDsHudExample,
    category: "Core",
  },
  {
    id: "pricing-table",
    name: "Pricing table",
    description:
      "Responsive pricing table with tiers, features, and CTAs built with Cards",
    component: DefaultPricingTable,
    category: "Advanced",
  },
];

interface BfDsDemoProps {
  initialSection?: string;
}

export function BfDsDemo(props: unknown = {}) {
  const { initialSection } = props as BfDsDemoProps;
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<string>(() => {
    if (initialSection) return initialSection;

    // Parse /ui/componentId from current path
    const match = router.currentPath.match(/^\/ui\/(.+)$/);
    return match?.[1] || "button";
  });

  // Update section when URL changes (back/forward navigation)
  useEffect(() => {
    const match = router.currentPath.match(/^\/ui\/(.+)$/);
    const sectionFromUrl = match?.[1] || "button";
    if (sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [router.currentPath]);

  // Handle section change with navigation
  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    router.navigate(`/ui/${sectionId}`);
  };

  const categories = useMemo(() => {
    const categoryMap = new Map<string, Array<ComponentSection>>();
    componentSections.forEach((section) => {
      const existing = categoryMap.get(section.category) || [];
      categoryMap.set(section.category, [...existing, section]);
    });
    return categoryMap;
  }, []);

  const ActiveComponent =
    componentSections.find((s) => s.id === activeSection)?.component ||
    BfDsButtonExample;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 68px)",
        backgroundColor: "var(--bfds-background)",
        color: "var(--bfds-text)",
        marginTop: 68,
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar */}
      <nav
        style={{
          width: "300px",
          backgroundColor: "var(--bfds-background-hover)",
          borderRight: "1px solid var(--bfds-border)",
          padding: "24px 0",
          overflowY: "auto",
          position: "sticky",
          top: 0,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ padding: "0 24px", marginBottom: "32px" }}>
          <h1
            style={{ margin: "0 0 8px 0", fontSize: "24px", fontWeight: "600" }}
          >
            BfDs Demo
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--bfds-text-secondary)",
              fontSize: "14px",
            }}
          >
            Interactive examples of BfDs design system components
          </p>
        </div>

        {Array.from(categories.entries()).map(([categoryName, sections]) => (
          <div key={categoryName}>
            <BfDsList header={categoryName}>
              {sections.map((section) => (
                <BfDsListItem
                  key={section.id}
                  active={activeSection === section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className="demo-sidebar-item"
                >
                  <div style={{ marginBottom: "4px" }}>{section.name}</div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: activeSection === section.id
                        ? "var(--bfds-background)"
                        : "var(--bfds-text-secondary)",
                      lineHeight: "1.3",
                    }}
                  >
                    {section.description}
                  </div>
                </BfDsListItem>
              ))}
            </BfDsList>
          </div>
        ))}
      </nav>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          minWidth: 0, // Prevents flex item from growing beyond container
        }}
      >
        <ActiveComponent />
      </main>
    </div>
  );
}
