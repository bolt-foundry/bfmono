# BfDsEmptyState

A component for displaying empty states with optional icons, actions, and custom
content. Used to guide users when data is unavailable, loading has failed, or
when prompting for initial actions.

## Props

```typescript
export interface BfDsEmptyStateProps {
  /** The icon to display */
  icon?: BfDsIconName;
  /** The main title text (required) */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button configuration */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
  };
  /** Optional secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Size variant of the empty state */
  size?: "small" | "medium" | "large";
  /** Additional content to display below the description */
  children?: ReactNode;
  /** Additional CSS class name */
  className?: string;
}
```

## Basic Usage

```tsx
import { BfDsEmptyState } from "@bfmono/bfDs";

// Simple empty state
<BfDsEmptyState
  title="No items found"
  description="Start by creating your first item"
/>

// With icon and action
<BfDsEmptyState
  icon="plus"
  title="No decks yet"
  description="Create your first evaluation deck to get started"
  action={{
    label: "Create Deck",
    onClick: handleCreateDeck,
    variant: "primary"
  }}
/>
```

## Icon Usage

Use contextually appropriate icons to reinforce the empty state message:

```tsx
// No data scenarios
<BfDsEmptyState
  icon="computer"
  title="No files found"
  description="Upload your first file to get started"
/>

// Search results
<BfDsEmptyState
  icon="exclamationCircle"
  title="No search results"
  description="Try adjusting your search criteria"
/>

// User-related empty states
<BfDsEmptyState
  icon="friend"
  title="No team members"
  description="Invite colleagues to join your workspace"
/>

// Configuration empty states
<BfDsEmptyState
  icon="settings"
  title="No settings configured"
  description="Configure your preferences to get started"
/>
```

## Action Buttons

### Primary Action

Provide a clear path forward with primary actions:

```tsx
<BfDsEmptyState
  icon="plus"
  title="Create your first deck"
  description="Evaluation decks help maintain consistent AI feedback"
  action={{
    label: "Create Deck",
    onClick: handleCreateDeck,
    variant: "primary",
  }}
/>;
```

### Multiple Actions

Offer primary and secondary options:

```tsx
<BfDsEmptyState
  icon="exclamationCircle"
  title="No results found"
  description="Try adjusting your search criteria or filters"
  action={{
    label: "Clear Filters",
    onClick: handleClearFilters,
    variant: "primary",
  }}
  secondaryAction={{
    label: "Learn More",
    onClick: handleLearnMore,
  }}
/>;
```

### Action Variants

Choose appropriate button styles:

```tsx
// Primary call-to-action
action={{ label: "Get Started", onClick: handler, variant: "primary" }}

// Secondary action
action={{ label: "Browse Examples", onClick: handler, variant: "secondary" }}

// Subtle action
action={{ label: "Skip Setup", onClick: handler, variant: "outline" }}
```

## Size Variants

### Small

Compact empty states for smaller containers:

```tsx
<BfDsEmptyState
  icon="exclamationTriangle"
  title="No data available"
  size="small"
/>;
```

### Medium (Default)

Standard size for most use cases:

```tsx
<BfDsEmptyState
  icon="infoCircle"
  title="Getting started"
  description="Follow the guide to set up your workspace"
  size="medium"
/>;
```

### Large

Prominent empty states for main content areas:

```tsx
<BfDsEmptyState
  icon="checkCircle"
  title="Welcome to the platform"
  description="Everything is set up and ready to go"
  size="large"
/>;
```

## Custom Content

Add additional content below the description:

```tsx
<BfDsEmptyState
  icon="exclamationStop"
  title="Connection failed"
  description="We couldn't connect to the server"
>
  <div className="error-details">
    <p>Error details: Connection timeout after 30 seconds</p>
    <code>Error Code: TIMEOUT_001</code>
  </div>
</BfDsEmptyState>;
```

## Common Use Cases

### No Data States

```tsx
// Empty lists
<BfDsEmptyState
  icon="plus"
  title="No projects yet"
  description="Create your first project to get started"
  action={{
    label: "New Project",
    onClick: handleCreateProject,
    variant: "primary"
  }}
/>

// Empty search results
<BfDsEmptyState
  icon="exclamationCircle"
  title="No search results"
  description="Try different keywords or adjust your filters"
  action={{
    label: "Clear Search",
    onClick: handleClearSearch,
    variant: "outline"
  }}
/>
```

### Error States

```tsx
// Loading failures
<BfDsEmptyState
  icon="exclamationTriangle"
  title="Failed to load data"
  description="Something went wrong while fetching your content"
  action={{
    label: "Retry",
    onClick: handleRetry,
    variant: "primary"
  }}
  secondaryAction={{
    label: "Report Issue",
    onClick: handleReportIssue
  }}
/>

// Permission errors
<BfDsEmptyState
  icon="exclamationStop"
  title="Access denied"
  description="You don't have permission to view this content"
  action={{
    label: "Request Access",
    onClick: handleRequestAccess,
    variant: "primary"
  }}
/>
```

### Onboarding States

```tsx
// First-time user experience
<BfDsEmptyState
  icon="star"
  title="Welcome to Bolt Foundry"
  description="Let's get you started with your first evaluation deck"
  action={{
    label: "Create Your First Deck",
    onClick: handleOnboarding,
    variant: "primary",
  }}
  secondaryAction={{
    label: "Take a Tour",
    onClick: handleTour,
  }}
/>;
```

### Configuration States

```tsx
// Setup required
<BfDsEmptyState
  icon="settings"
  title="Setup required"
  description="Configure your workspace settings to continue"
  action={{
    label: "Open Settings",
    onClick: handleSettings,
    variant: "primary",
  }}
/>;
```

## Interactive Examples

### Conditional Rendering

```tsx
const EmptyProjectsList = ({ projects, onCreateProject, onLoadDemo }) => {
  if (projects.length === 0) {
    return (
      <BfDsEmptyState
        icon="plus"
        title="No projects yet"
        description="Create your first project or load a demo to get started"
        action={{
          label: "Create Project",
          onClick: onCreateProject,
          variant: "primary",
        }}
        secondaryAction={{
          label: "Load Demo",
          onClick: onLoadDemo,
        }}
      />
    );
  }

  return <ProjectList projects={projects} />;
};
```

### With Loading States

```tsx
const DataContainer = ({ isLoading, data, error, onRetry }) => {
  if (isLoading) {
    return <BfDsSpinner />;
  }

  if (error) {
    return (
      <BfDsEmptyState
        icon="exclamationTriangle"
        title="Failed to load data"
        description={error.message}
        action={{
          label: "Try Again",
          onClick: onRetry,
          variant: "primary",
        }}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <BfDsEmptyState
        icon="plus"
        title="No data available"
        description="Start by adding your first item"
      />
    );
  }

  return <DataList data={data} />;
};
```

## Accessibility

BfDsEmptyState includes accessibility features:

- **Semantic HTML**: Uses appropriate heading hierarchy
- **Screen Reader Support**: Title and description are properly structured
- **Keyboard Navigation**: Action buttons are fully keyboard accessible
- **Focus Management**: Logical tab order for interactive elements

### Best Practices

- Use descriptive titles that clearly explain the empty state
- Provide actionable descriptions when possible
- Include clear next steps through action buttons
- Choose icons that reinforce the message without relying solely on them
- Test with screen readers to ensure content is accessible

## Design Guidelines

### Title Guidelines

- Keep titles concise and descriptive
- Use sentence case (not ALL CAPS)
- Focus on what's missing or what action is needed
- Examples: "No decks yet", "Search results empty", "Setup required"

### Description Guidelines

- Provide context and guidance
- Suggest specific actions when possible
- Keep descriptions helpful but brief
- Examples: "Create your first deck to get started", "Try different keywords"

### Action Guidelines

- Use action-oriented labels: "Create", "Add", "Try Again"
- Prioritize the most important action as primary
- Limit to 1-2 actions to avoid decision paralysis
- Make actions contextually relevant

## Styling Notes

BfDsEmptyState uses CSS classes with the `bfds-empty-state` prefix:

- `.bfds-empty-state` - Base container styles
- `.bfds-empty-state--{size}` - Size-specific styles
- `.bfds-empty-state__icon` - Icon container
- `.bfds-empty-state__title` - Title styling
- `.bfds-empty-state__description` - Description text
- `.bfds-empty-state__content` - Custom content container
- `.bfds-empty-state__actions` - Action buttons container

The component automatically:

- Scales icon size based on the size prop
- Adjusts button sizes to match the empty state size
- Centers all content for optimal visual hierarchy
- Provides appropriate spacing between elements
