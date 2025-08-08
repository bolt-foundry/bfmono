# BfDsTabs

A comprehensive tab navigation component with support for icons, disabled
states, nested subtabs, and both controlled and uncontrolled modes. Perfect for
organizing content into separate views.

## Props

```typescript
export type BfDsTabItem = {
  /** Unique identifier for the tab */
  id: string;
  /** Display text for the tab */
  label: string;
  /** Content to show when tab is active */
  content: React.ReactNode;
  /** Optional icon to display in tab */
  icon?: BfDsIconName;
  /** When true, tab cannot be selected */
  disabled?: boolean;
  /** Optional nested subtabs */
  subtabs?: Array<BfDsTabItem>;
};

export type BfDsTabsProps = {
  /** Array of tab items to display */
  tabs: Array<BfDsTabItem>;
  /** Currently active tab ID (controlled) */
  activeTab?: string;
  /** Default active tab ID (uncontrolled) */
  defaultActiveTab?: string;
  /** Callback when tab selection changes */
  onTabChange?: (tabId: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Visual style variant */
  variant?: "primary" | "secondary";
  /** Size variant for tabs */
  size?: "small" | "medium" | "large";
};
```

## Basic Usage

```tsx
import { BfDsTabs } from "@bfmono/bfDs";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    content: <div>Overview content here</div>,
  },
  {
    id: "settings",
    label: "Settings",
    content: <div>Settings content here</div>,
  },
  {
    id: "help",
    label: "Help",
    content: <div>Help content here</div>,
  },
];

// Basic uncontrolled tabs
<BfDsTabs tabs={tabs} defaultActiveTab="overview" />;

// With icons
const tabsWithIcons = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "autoframe",
    content: <div>Dashboard content</div>,
  },
  {
    id: "projects",
    label: "Projects",
    icon: "computer",
    content: <div>Projects content</div>,
  },
];

<BfDsTabs tabs={tabsWithIcons} />;
```

## Controlled vs Uncontrolled

### Uncontrolled Mode

Let the component manage its own state:

```tsx
<BfDsTabs
  tabs={tabs}
  defaultActiveTab="overview"
  onTabChange={(tabId) => console.log("Tab changed to:", tabId)}
/>;
```

### Controlled Mode

Manage the active tab externally:

```tsx
const [activeTab, setActiveTab] = useState("overview");

<BfDsTabs
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>;
```

## Tab Configuration

### Icons in Tabs

Add visual context with icons:

```tsx
const tabsWithIcons = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "autoframe",
    content: <DashboardContent />,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "arrowsLeftRight",
    content: <AnalyticsContent />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: "burgerMenu",
    content: <SettingsContent />,
  },
];
```

### Disabled Tabs

Prevent interaction with specific tabs:

```tsx
const tabsWithDisabled = [
  {
    id: "available",
    label: "Available",
    content: <div>This tab is available</div>,
  },
  {
    id: "coming-soon",
    label: "Coming Soon",
    disabled: true,
    content: <div>This content won't be shown</div>,
  },
];
```

### Rich Tab Content

Include complex content in tabs:

```tsx
const tabs = [
  {
    id: "overview",
    label: "Overview",
    content: (
      <div>
        <h2>Project Overview</h2>
        <p>This project aims to...</p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <BfDsButton variant="primary">Get Started</BfDsButton>
          <BfDsButton variant="outline">Learn More</BfDsButton>
        </div>
      </div>
    ),
  },
  {
    id: "details",
    label: "Details",
    content: (
      <div>
        <h2>Project Details</h2>
        <BfDsList>
          <BfDsListItem>Feature A</BfDsListItem>
          <BfDsListItem>Feature B</BfDsListItem>
          <BfDsListItem>Feature C</BfDsListItem>
        </BfDsList>
      </div>
    ),
  },
];
```

## Nested Tabs (Subtabs)

Create hierarchical navigation with subtabs:

```tsx
const tabsWithSubtabs = [
  {
    id: "documentation",
    label: "Documentation",
    icon: "brand-github",
    content: <div>Main documentation content</div>,
    subtabs: [
      {
        id: "getting-started",
        label: "Getting Started",
        content: (
          <div>
            <h3>Getting Started</h3>
            <p>Welcome to our platform! Here's how to get started...</p>
          </div>
        ),
      },
      {
        id: "api-reference",
        label: "API Reference",
        icon: "arrowRight",
        content: (
          <div>
            <h3>API Reference</h3>
            <p>Complete API documentation with examples...</p>
          </div>
        ),
      },
      {
        id: "examples",
        label: "Examples",
        content: (
          <div>
            <h3>Code Examples</h3>
            <p>Real-world examples and use cases...</p>
          </div>
        ),
      },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: "brand-discord",
    content: <div>Main support content</div>,
    subtabs: [
      {
        id: "faq",
        label: "FAQ",
        content: <div>Frequently asked questions...</div>,
      },
      {
        id: "contact",
        label: "Contact Us",
        disabled: true,
        content: <div>Contact form...</div>,
      },
    ],
  },
];

<BfDsTabs tabs={tabsWithSubtabs} defaultActiveTab="documentation" />;
```

## Visual Variants

### Primary Style (Default)

```tsx
<BfDsTabs tabs={tabs} variant="primary" />;
```

### Secondary Style

```tsx
<BfDsTabs tabs={tabs} variant="secondary" />;
```

## Size Variants

### Small Tabs

Compact tabs for sidebar or constrained spaces:

```tsx
<BfDsTabs tabs={tabs} size="small" />;
```

### Medium Tabs (Default)

Standard size for most applications:

```tsx
<BfDsTabs tabs={tabs} size="medium" />;
```

### Large Tabs

Prominent tabs for primary navigation:

```tsx
<BfDsTabs tabs={tabs} size="large" />;
```

## Common Use Cases

### Application Navigation

```tsx
const appTabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "autoframe",
    content: <DashboardPage />,
  },
  {
    id: "projects",
    label: "Projects",
    icon: "computer",
    content: <ProjectsPage />,
  },
  {
    id: "team",
    label: "Team",
    icon: "friend",
    content: <TeamPage />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    content: <SettingsPage />,
  },
];

function AppNavigation() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <BfDsTabs
      tabs={appTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      size="large"
    />
  );
}
```

### Settings Organization

```tsx
const settingsTabs = [
  {
    id: "profile",
    label: "Profile",
    content: (
      <div>
        <h2>Profile Settings</h2>
        <BfDsForm>
          <BfDsInput label="Display Name" />
          <BfDsInput label="Email" type="email" />
          <BfDsTextArea label="Bio" />
        </BfDsForm>
      </div>
    ),
  },
  {
    id: "security",
    label: "Security",
    content: (
      <div>
        <h2>Security Settings</h2>
        <BfDsForm>
          <BfDsInput label="Current Password" type="password" />
          <BfDsInput label="New Password" type="password" />
          <BfDsCheckbox label="Enable two-factor authentication" />
        </BfDsForm>
      </div>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    content: (
      <div>
        <h2>Notification Preferences</h2>
        <BfDsCheckbox label="Email notifications" />
        <BfDsCheckbox label="Push notifications" />
        <BfDsCheckbox label="SMS alerts" />
      </div>
    ),
  },
];
```

### Documentation Browser

```tsx
const docTabs = [
  {
    id: "guides",
    label: "Guides",
    subtabs: [
      {
        id: "quickstart",
        label: "Quick Start",
        content: <QuickStartGuide />,
      },
      {
        id: "advanced",
        label: "Advanced",
        content: <AdvancedGuide />,
      },
    ],
  },
  {
    id: "api",
    label: "API Reference",
    subtabs: [
      {
        id: "rest",
        label: "REST API",
        content: <RestApiDocs />,
      },
      {
        id: "graphql",
        label: "GraphQL",
        content: <GraphQLDocs />,
      },
    ],
  },
];
```

### Data Visualization Dashboard

```tsx
const analyticsTabs = [
  {
    id: "overview",
    label: "Overview",
    icon: "arrowsLeftRight",
    content: <OverviewCharts />,
  },
  {
    id: "users",
    label: "Users",
    icon: "friend",
    content: <UserAnalytics />,
  },
  {
    id: "performance",
    label: "Performance",
    icon: "computer",
    content: <PerformanceMetrics />,
  },
  {
    id: "reports",
    label: "Reports",
    icon: "fileText",
    content: <ReportsView />,
  },
];
```

## State Management

### Tab Change Handling

```tsx
function TabWithState() {
  const [activeTab, setActiveTab] = useState("tab1");
  const [tabHistory, setTabHistory] = useState(["tab1"]);

  const handleTabChange = (newTabId: string) => {
    setActiveTab(newTabId);
    setTabHistory((prev) => [...prev, newTabId]);

    // Analytics tracking
    analytics.track("tab_changed", { from: activeTab, to: newTabId });
  };

  return (
    <BfDsTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
```

### URL Integration

```tsx
import { useLocation, useNavigate } from "react-router-dom";

function UrlTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop() || "overview";

  const handleTabChange = (tabId: string) => {
    navigate(`/dashboard/${tabId}`);
  };

  return (
    <BfDsTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}
```

## Accessibility

### Keyboard Navigation

- **Tab/Shift+Tab**: Navigate through tabs
- **Arrow Keys**: Navigate between tabs in the same group
- **Enter/Space**: Activate a tab
- **Home/End**: Jump to first/last tab

### Screen Reader Support

- Uses proper ARIA roles (`role="tab"`, `role="tablist"`, `role="tabpanel"`)
- Maintains `aria-selected` and `aria-controls` relationships
- Provides context for nested subtabs

### Focus Management

- Clear focus indicators on all tabs
- Logical tab order through main tabs and subtabs
- Focus restoration when switching between content areas

## Performance Considerations

### Content Rendering

Only the active tab's content is rendered in the DOM:

```tsx
// Only renders content for the currently active tab
<BfDsTabs tabs={largeTabs} />;
```

### Lazy Content Loading

```tsx
const tabsWithLazyContent = [
  {
    id: "data",
    label: "Data",
    content: lazy(() => import("./DataComponent")),
  },
  {
    id: "analytics",
    label: "Analytics",
    content: lazy(() => import("./AnalyticsComponent")),
  },
];
```

## Styling Notes

BfDsTabs uses CSS classes with the `bfds-tabs` prefix:

- `.bfds-tabs` - Main container
- `.bfds-tabs--{variant}` - Variant-specific styling
- `.bfds-tabs--{size}` - Size-specific styling
- `.bfds-tabs__header` - Tab buttons container
- `.bfds-tabs__subheader` - Subtab buttons container
- `.bfds-tabs__content` - Content area
- `.bfds-tabs__panel` - Individual content panel
- `.bfds-tabs__subpanel` - Subtab content panel
- `.bfds-tab` - Individual tab button
- `.bfds-tab--active` - Active tab styling
- `.bfds-tab--disabled` - Disabled tab styling
- `.bfds-subtab` - Individual subtab button
- `.bfds-subtab--active` - Active subtab styling

The component automatically handles:

- Icon sizing based on tab size
- Smooth transitions between active states
- Responsive behavior for smaller screens
- Proper contrast and accessibility colors

## Best Practices

### Content Organization

- Keep tab labels concise and descriptive
- Use icons sparingly to avoid clutter
- Group related functionality within tabs
- Limit the number of main tabs to 5-7 for usability

### Navigation Design

- Make the active tab clearly visible
- Provide feedback for disabled tabs
- Use consistent iconography across tabs
- Consider mobile behavior for responsive design

### Performance

- Avoid heavy computations in tab content
- Use lazy loading for complex tab content
- Consider virtualization for many tabs
- Optimize subtab navigation patterns
