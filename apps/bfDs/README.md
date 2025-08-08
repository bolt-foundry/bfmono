# BfDs Design System

Bolt Foundry Design System (BfDs) is a comprehensive React component library
that provides consistent, accessible, and well-designed UI components for Bolt
Foundry applications.

## Overview

BfDs follows a "simple is almost always better than complex" philosophy,
providing functional components that can be quickly integrated and customized as
needed. The design system is built with TypeScript and React, ensuring type
safety and excellent developer experience.

## Getting Started

### Installation

BfDs is designed to be used within the Bolt Foundry monorepo. Import components
directly:

```tsx
import { BfDsButton, BfDsIcon, BfDsProvider } from "@bfmono/bfDs";
```

### Setup

Wrap your application with the `BfDsProvider` to enable toast notifications and
other global features:

```tsx
import { BfDsProvider } from "@bfmono/bfDs";

function App() {
  return (
    <BfDsProvider>
      {/* Your app content */}
    </BfDsProvider>
  );
}
```

## Component Categories

### Form Components

Form components for user input and data collection.

- **BfDsForm** - Form container with validation context
- **BfDsInput** - Text input field
- **BfDsTextArea** - Multi-line text input
- **BfDsSelect** - Dropdown selection
- **BfDsCheckbox** - Checkbox input
- **BfDsRadio** - Radio button group
- **BfDsToggle** - Toggle switch
- **BfDsRange** - Range slider input
- **BfDsFormSubmitButton** - Form submission button

### Action Components

Components for user interactions and actions.

- **BfDsButton** - Primary action button
- **BfDsCopyButton** - Copy-to-clipboard button

### Display Components

Components for presenting information and content.

- **BfDsIcon** - Icon component
- **BfDsSpinner** - Loading indicators
- **BfDsBadge** - Status and count badges
- **BfDsPill** - Pill-shaped labels
- **BfDsCard** - Content container
- **BfDsCallout** - Highlighted information boxes
- **BfDsEmptyState** - Empty state messaging

### Navigation Components

Components for navigation and organization.

- **BfDsTabs** - Tab navigation
- **BfDsList** - List container
- **BfDsListItem** - Individual list items
- **BfDsListBar** - List header with actions

### Overlay Components

Components that appear above other content.

- **BfDsModal** - Modal dialogs
- **BfDsToast** - Toast notifications
- **BfDsHud** - Heads-up display overlay

### Provider Components

Components that provide context and global functionality.

- **BfDsProvider** - Root provider component with toast notifications and HUD

## Design Principles

### Simplicity First

Components are designed to be simple and functional rather than overly complex.
Each component solves a specific use case effectively.

### Type Safety

All components are fully typed with TypeScript, providing excellent IntelliSense
and compile-time error checking.

### Consistency

Components follow consistent naming patterns, prop interfaces, and styling
approaches across the system.

### Accessibility

Components are built with accessibility in mind, including proper ARIA
attributes, keyboard navigation, and screen reader support.

### Composability

Components can be easily composed together to create more complex UI patterns
while maintaining consistency.

## Common Patterns

### Variants

Many components support different visual variants:

```tsx
<BfDsButton variant="primary">Primary Action</BfDsButton>
<BfDsButton variant="secondary">Secondary Action</BfDsButton>
<BfDsButton variant="danger">Delete</BfDsButton>
```

### Sizes

Size variants provide visual hierarchy:

```tsx
<BfDsIcon size="small" name="user" />
<BfDsIcon size="medium" name="user" />
<BfDsIcon size="large" name="user" />
```

### States

Components support different interaction states:

```tsx
<BfDsInput state="default" />
<BfDsInput state="error" />
<BfDsInput state="disabled" />
```

## Contributing

When adding new components to BfDs:

1. Create the component file in `/components/`
2. Add comprehensive TypeScript interfaces
3. Include example usage in `/__examples__/`
4. Add tests in `/__tests__/`
5. Update the main export in `/index.ts`
6. Document the component following this documentation pattern

## Support

For questions about BfDs components or suggestions for improvements, consult the
individual component documentation or reach out to Justin on the Bolt Foundry
development team.
