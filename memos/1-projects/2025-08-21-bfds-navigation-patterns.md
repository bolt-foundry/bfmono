# BfDs Navigation Patterns Enhancement

**Date:** 2025-08-21\
**Status:** Planning\
**Assignee:** Justin Carter\
**Priority:** Medium

## Problem Statement

Currently, BfDs components handle navigation inconsistently:

- **BfDsButton** has comprehensive navigation support (`href`, `link`, `target`
  props)
- **Clickable components** (BfDsListItem, BfDsListBar, BfDsTabs, BfDsCard,
  BfDsBadge) only support `onClick` callbacks
- **Navigation patterns** are implemented ad-hoc at the application level
- **Accessibility** suffers when divs with onClick are used instead of semantic
  anchors
- **SEO** impact from non-crawlable navigation elements

## Current State Analysis

### Components with Navigation Needs

| Component        | Current Pattern                     | Use Cases                         |
| ---------------- | ----------------------------------- | --------------------------------- |
| **BfDsButton**   | `href`, `link`, `target`, `onClick` | ✅ Complete navigation support    |
| **BfDsListItem** | `onClick` only                      | Sidebar navigation, menu items    |
| **BfDsListBar**  | `onClick` only                      | Data row navigation, list actions |
| **BfDsTabs**     | `onTabChange` callback              | Tab-based page navigation         |
| **BfDsCard**     | `onClick` only                      | Product cards, content navigation |
| **BfDsBadge**    | `onClick` only                      | Tag navigation, category links    |

### Current Implementation Gaps

1. **Inconsistent API** across components
2. **Semantic HTML** not used for navigation (accessibility issue)
3. **SEO implications** of div+onClick vs anchor elements
4. **Developer experience** requires manual navigation handling

## Proposed Solution

### Option 1: Smart Navigation with Single Prop (RECOMMENDED)

Use a single navigation prop with automatic internal/external detection:

```typescript
// Shared helper function
function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url) ||
    /^mailto:/.test(url) ||
    /^tel:/.test(url) ||
    url.startsWith("//");
}

// Add to all clickable components
type NavigationProps = {
  /** URL or path to navigate to (auto-detects internal vs external) */
  to?: string;
  /** Link target (_blank, _self, etc.) - defaults to _blank for external links */
  target?: string;
  /** Maintain existing onClick for other interactions */
  onClick?: () => void;
};
```

#### Benefits

- ✅ **Simplified API** - single prop instead of href/link confusion
- ✅ **Intuitive** - developers don't need to choose between props
- ✅ **Centralized logic** - helper function prevents duplication
- ✅ **Smart defaults** - external links automatically get target="_blank"
- ✅ **Accessibility** via semantic anchor elements
- ✅ **SEO benefits** from crawlable links
- ✅ **Backward compatibility** (existing onClick preserved)

#### Component Behavior

```typescript
// In component implementation
if (to) {
  if (isExternalUrl(to)) {
    return <a href={to} target={target || "_blank"}>{content}</a>;
  } else {
    // TODO: Replace with RouterLink when React Router integration is implemented
    return <a href={to} target={target || "_self"}>{content}</a>;
  }
}
// Fallback to button for onClick only
```

**Note:** React Router integration is not currently implemented in BfDs
components. BfDsButton currently falls back to rendering anchor tags for both
`href` and `link` props. This implementation would follow the same pattern
initially, with a clear path to upgrade to proper router integration later.

## Implementation Plan

### Phase 1: Core Components

1. **BfDsListItem** - Most common navigation use case
2. **BfDsListBar** - Navigation rows and data tables

### Phase 2: Extended Components

3. **BfDsTabs** - Tab-based navigation
4. **BfDsCard** - Content and product navigation

### Phase 3: Specialized Components

5. **BfDsBadge** - Tag and category navigation

### Technical Implementation

#### Special Considerations: BfDsTabs

BfDsTabs has unique complexity that requires special consideration:

**Multi-Level Navigation Architecture:**

- **Main tabs** - Top-level navigation
- **Subtabs** - Nested navigation within each main tab
- Each level might need different navigation behavior

**Route-Based Tab Selection (RECOMMENDED APPROACH):**

Instead of managing complex active state synchronization, derive tab selection
from the current route:

```typescript
export type BfDsTabItem = {
  id: string;
  label: string;
  content: React.ReactNode;
  // Add navigation to individual tab items
  to?: string; // Navigate when tab is clicked
  icon?: BfDsIconName;
  disabled?: boolean;
  subtabs?: Array<BfDsTabItem>; // Subtabs can also have 'to' prop
};

// Helper function to determine active tab from route
const getActiveTabFromRoute = (
  tabs: BfDsTabItem[],
  currentPath: string,
): string | null => {
  for (const tab of tabs) {
    if (tab.to && currentPath.startsWith(tab.to)) {
      return tab.id;
    }
    // Check subtabs too
    if (tab.subtabs) {
      for (const subtab of tab.subtabs) {
        if (subtab.to && currentPath.startsWith(subtab.to)) {
          return tab.id; // Parent tab becomes active
        }
      }
    }
  }
  return null;
};

// Component usage
const BfDsTabs = ({ tabs, currentPath, onTabChange }) => {
  const activeTab = getActiveTabFromRoute(tabs, currentPath) || defaultTab;

  const handleTabClick = (tab: BfDsTabItem) => {
    if (tab.to) {
      // Just navigate - route determines active state
      if (isExternalUrl(tab.to)) {
        window.location.href = tab.to;
      } else {
        navigate(tab.to); // Router handles the rest
      }
      onTabChange?.(tab.id); // Optional callback
    } else {
      // Content switching only (existing behavior)
      setActiveTab(tab.id);
      onTabChange?.(tab.id);
    }
  };
};
```

**Mixed Usage Support:**

```typescript
const appTabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    to: "/dashboard", // Route-based - active when current path starts with /dashboard
    content: <DashboardPage />,
  },
  {
    id: "settings",
    label: "Settings",
    // No 'to' prop = content switching only
    content: <SettingsForm />,
    subtabs: [
      { id: "profile", label: "Profile", to: "/settings/profile" },
      { id: "billing", label: "Billing", to: "/settings/billing" },
    ],
  },
];

// Usage with route detection
<BfDsTabs
  tabs={appTabs}
  currentPath={window.location.pathname}
  onTabChange={(tabId) => analytics.track("tab_change", { tabId })}
/>;
```

**Key Benefits:**

- **Eliminates state synchronization issues** - Route is single source of truth
- **Handles browser navigation automatically** - Back/forward buttons work
- **Simpler implementation** - No complex active state management
- **URL sharing support** - Direct links to tabs work
- **Mixed usage support** - Some tabs route, others switch content
- **Backward compatibility** - Existing content-switching behavior preserved

### Additional Navigation Considerations

#### 1. URL Handling Edge Cases

The `isExternalUrl` helper and navigation logic should handle:

```typescript
function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url) ||
    /^mailto:/.test(url) ||
    /^tel:/.test(url) ||
    url.startsWith("//");
}

// Additional cases to consider:
// - Hash links: "#section" (same page navigation)
// - Query parameters: "?tab=settings" (URL state)
// - Relative paths: "../page", "./page"
// - Protocol-relative: "//example.com"
// - JavaScript URLs: "javascript:void(0)" (security risk - should block)
```

**Implementation decisions needed:**

- Should hash links (`#section`) trigger navigation or scroll behavior?
- How to handle relative paths (`../page`) - treat as internal or external?
- Should we block `javascript:` URLs for security?

#### 2. Security Considerations

**External Link Security:**

```typescript
// External links should include security attributes
if (isExternalUrl(to)) {
  return (
    <a
      href={to}
      target={target || "_blank"}
      rel="noopener noreferrer" // Prevent window.opener access
      className="bfds-component__link"
    >
      {content}
    </a>
  );
}
```

**URL Sanitization:**

- Validate URLs to prevent XSS attacks
- Consider allowlist/blocklist for certain URL patterns
- Block dangerous protocols (`javascript:`, `data:` with executable content)

#### 3. Navigation Interception

Developers may need to intercept navigation for:

```typescript
// Enhanced navigation with interception
const handleNavigation = (to: string) => {
  // Check for unsaved changes
  if (hasUnsavedChanges && !confirm("You have unsaved changes. Continue?")) {
    return; // Prevent navigation
  }

  // Track analytics
  analytics.track("navigation", { to, component: "BfDsListItem" });

  // Handle authentication
  if (requiresAuth(to) && !isAuthenticated) {
    navigate("/login", { returnTo: to });
    return;
  }

  // Proceed with navigation
  navigate(to);
};
```

**Implementation approach:**

- Enhanced callback signature with cancellation support
- Return `false` from `onClick` to prevent navigation
- Navigation promise/async support for complex logic

#### 4. Accessibility Deep Dive

**Screen Reader Support:**

```typescript
// Announce navigation intent
<a
  href={to}
  aria-label={`Navigate to ${label}`}
  onClick={handleClick}
>
  {content}
</a>;
```

**Focus Management:**

- Preserve focus order when navigation fails
- Announce navigation state changes
- Handle keyboard navigation (Enter vs Space behavior)

**ARIA Attributes:**

- `aria-current="page"` for current page indicators
- `aria-describedby` for navigation hints
- `role="link"` vs `role="button"` based on behavior

#### 5. Performance & UX Considerations

**Link Prefetching:**

```typescript
// Prefetch internal links on hover
<a
  href={to}
  onMouseEnter={() => prefetch(to)}
  onClick={handleClick}
>
  {content}
</a>;
```

**Loading States:**

- Show loading indicator for slow navigation
- Disable component during navigation
- Timeout handling for failed navigation

**Error Handling:**

- Graceful degradation when navigation fails
- Fallback to `window.location.href` if router fails
- Error boundaries for navigation components

#### 6. Router Integration Strategy

**Router Library Decision:**

- React Router (most common)
- Next.js router (if using Next.js)
- Reach Router (deprecated)
- Custom router solution

**Implementation Pattern:**

```typescript
// Flexible router integration
const navigate = useCallback((to: string) => {
  if (isExternalUrl(to)) {
    window.location.href = to;
  } else {
    // Use whatever router is available
    if (typeof router?.push === "function") {
      router.push(to);
    } else if (typeof navigate === "function") {
      navigate(to);
    } else {
      // Fallback to browser navigation
      window.location.href = to;
    }
  }
}, [router, navigate]);
```

**Hook Integration:**

- Abstract router-specific hooks behind common interface
- Support for different navigation methods (push, replace, back)
- Route matching and parameter extraction

#### 7. Developer Experience

**TypeScript Integration:**

```typescript
// Route typing support
type AppRoute = "/dashboard" | "/settings" | "/profile";

interface NavigationProps {
  to?: AppRoute | string; // Allow typed routes + external URLs
  target?: string;
  onClick?: () => void;
}
```

**Testing Utilities:**

```typescript
// Mock navigation for tests
const mockNavigate = jest.fn();
jest.mock("@bfmono/navigation-utils", () => ({
  navigate: mockNavigate,
  isExternalUrl: jest.requireActual("@bfmono/navigation-utils").isExternalUrl,
}));
```

**Documentation Examples:**

- Common navigation patterns
- Router integration examples
- Testing strategies
- Performance optimization tips

#### Example: BfDsListItem Enhancement

```typescript
export type BfDsListItemProps = {
  // ... existing props

  // New navigation props
  /** URL or path to navigate to (auto-detects internal vs external) */
  to?: string;
  /** Target attribute for links (defaults to _blank for external links) */
  target?: "_blank" | "_self" | "_parent" | "_top" | string;
  /** Click handler for non-navigation interactions */
  onClick?: () => void;
};
```

#### Rendering Logic

```typescript
// In component implementation
if (to) {
  if (isExternalUrl(to)) {
    return (
      <li className={classes}>
        <a
          href={to}
          target={target || "_blank"}
          className="bfds-list-item__link"
        >
          {content}
        </a>
      </li>
    );
  } else {
    return (
      <li className={classes}>
        {/* TODO: Replace with RouterLink when React Router integration is implemented */}
        <a
          href={to}
          target={target || "_self"}
          className="bfds-list-item__link"
        >
          {content}
        </a>
      </li>
    );
  }
}

// Fallback to button/div for onClick only
return (
  <li className={classes}>
    {onClick
      ? (
        <button onClick={onClick} className="bfds-list-item__button">
          {content}
        </button>
      )
      : (
        <div className="bfds-list-item__content">
          {content}
        </div>
      )}
  </li>
);
```

## Success Criteria

- [ ] All clickable BfDs components support standardized navigation props
- [ ] Navigation renders semantic HTML (anchors) when appropriate
- [ ] Backward compatibility maintained for existing onClick usage
- [ ] Documentation updated with navigation examples
- [ ] TypeScript types properly exported and documented
- [ ] Accessibility audit passes for navigation components
- [ ] Performance impact assessed and acceptable

## Timeline

**Estimated Duration:** 2-3 weeks

- Week 1: BfDsListItem + BfDsListBar implementation and testing
- Week 2: BfDsTabs + BfDsCard implementation
- Week 3: BfDsBadge implementation, documentation, final testing

## Dependencies

- **React Router integration** - Currently not implemented, will need to be
  added
- Design review for any visual changes needed
- Accessibility testing capabilities
- Decision on router library choice (React Router, Next.js router, etc.)

## Questions for Discussion

1. Should we create a shared `@bfmono/navigation-utils` package for the
   `isExternalUrl` helper?
2. Do we need additional props like `replace` for router navigation?
3. Should we add `onClick` + `to` behavior (navigation with tracking/analytics)?
4. What's the migration strategy for existing components using onClick for
   navigation?
5. Should we also update BfDsButton to use this simpler `to` prop pattern for
   consistency?
6. Do we need to handle special cases like anchor links (`#section`) or relative
   paths (`../page`)?

## Next Steps

1. **Team review** of this proposal
2. **Technical spike** on one component (BfDsListItem) to validate approach
3. **Design review** for any visual/UX considerations
4. **Implementation planning** and assignment
