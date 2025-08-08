# BfDsCard

A versatile card container component for grouping related content. Features
multiple visual variants, optional header/footer sections, clickable states, and
size variations. Cards provide a consistent way to organize and present
information.

## Props

```typescript
export type BfDsCardProps = {
  /** Content inside the card */
  children: ReactNode;
  /** Card header content */
  header?: ReactNode;
  /** Card footer content */
  footer?: ReactNode;
  /** Variant style of the card */
  variant?: "default" | "elevated" | "outlined" | "flat";
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Click handler for clickable cards */
  onClick?: () => void;
  /** Whether the card is selected/active */
  selected?: boolean;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">;
```

## Basic Usage

```tsx
import { BfDsCard } from "@bfmono/bfDs";

// Simple card
<BfDsCard>
  <h3>Card Title</h3>
  <p>Card content goes here.</p>
</BfDsCard>

// Card with header and footer
<BfDsCard
  header={<h3>Card Header</h3>}
  footer={<button>Action</button>}
>
  <p>Main card content.</p>
</BfDsCard>
```

## Visual Variants

```tsx
// Default card with subtle shadow
<BfDsCard variant="default">
  <p>Default card styling</p>
</BfDsCard>

// Elevated card with prominent shadow
<BfDsCard variant="elevated">
  <p>Elevated card with more shadow</p>
</BfDsCard>

// Outlined card with border
<BfDsCard variant="outlined">
  <p>Card with border outline</p>
</BfDsCard>

// Flat card with no shadow
<BfDsCard variant="flat">
  <p>Flat card with no elevation</p>
</BfDsCard>
```

## Size Variants

```tsx
// Small card
<BfDsCard size="small">
  <p>Compact card content</p>
</BfDsCard>

// Medium card (default)
<BfDsCard size="medium">
  <p>Standard card content</p>
</BfDsCard>

// Large card
<BfDsCard size="large">
  <h2>Large Card</h2>
  <p>More spacious card content</p>
</BfDsCard>
```

## Clickable Cards

```tsx
const [selectedCard, setSelectedCard] = useState(null);

<BfDsCard
  clickable
  selected={selectedCard === 'card1'}
  onClick={() => setSelectedCard('card1')}
>
  <h3>Clickable Card</h3>
  <p>Click me to select</p>
</BfDsCard>

<BfDsCard
  clickable
  selected={selectedCard === 'card2'}
  onClick={() => setSelectedCard('card2')}
>
  <h3>Another Card</h3>
  <p>Click me to select</p>
</BfDsCard>
```

## Header and Footer

```tsx
// Card with complex header
<BfDsCard
  header={
    <div className="flex justify-between items-center">
      <h3>Project Status</h3>
      <BfDsPill variant="success" text="Active" />
    </div>
  }
  footer={
    <div className="flex gap-2">
      <BfDsButton variant="primary">Edit</BfDsButton>
      <BfDsButton variant="secondary">View</BfDsButton>
    </div>
  }
>
  <p>Project details and information.</p>
</BfDsCard>

// Card with simple header and footer
<BfDsCard
  header="Settings"
  footer={<BfDsButton>Save Changes</BfDsButton>}
>
  <BfDsToggle label="Enable notifications" />
  <BfDsToggle label="Dark mode" />
</BfDsCard>
```

## States

```tsx
// Selected state
<BfDsCard selected>
  <p>This card is selected</p>
</BfDsCard>

// Disabled state
<BfDsCard disabled>
  <p>This card is disabled</p>
</BfDsCard>

// Disabled clickable card
<BfDsCard clickable disabled onClick={() => {}}>
  <p>This clickable card is disabled</p>
</BfDsCard>
```

## Common Use Cases

### Product Cards

```tsx
<div className="grid grid-cols-3 gap-4">
  {products.map((product) => (
    <BfDsCard
      key={product.id}
      variant="outlined"
      clickable
      onClick={() => selectProduct(product.id)}
      header={
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-32 object-cover"
        />
      }
      footer={
        <div className="flex justify-between items-center">
          <span className="font-bold">${product.price}</span>
          <BfDsButton size="small">Add to Cart</BfDsButton>
        </div>
      }
    >
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </BfDsCard>
  ))}
</div>;
```

### Dashboard Widgets

```tsx
<div className="dashboard-grid">
  <BfDsCard
    variant="elevated"
    header="Total Revenue"
  >
    <div className="text-3xl font-bold text-green-600">
      $45,231
    </div>
    <div className="text-sm text-gray-500">
      +12% from last month
    </div>
  </BfDsCard>

  <BfDsCard
    variant="elevated"
    header="Active Users"
  >
    <div className="text-3xl font-bold text-blue-600">
      1,234
    </div>
    <div className="text-sm text-gray-500">
      +5% from last month
    </div>
  </BfDsCard>
</div>;
```

### Settings Sections

```tsx
<div className="settings-sections">
  <BfDsCard
    header="Account Settings"
    footer={<BfDsButton>Update Account</BfDsButton>}
  >
    <BfDsInput label="Display Name" />
    <BfDsInput label="Email" type="email" />
  </BfDsCard>

  <BfDsCard
    header="Notification Preferences"
    footer={<BfDsButton>Save Preferences</BfDsButton>}
  >
    <BfDsToggle label="Email notifications" />
    <BfDsToggle label="Push notifications" />
    <BfDsToggle label="Marketing emails" />
  </BfDsCard>
</div>;
```

### Selection Lists

```tsx
const [selectedOption, setSelectedOption] = useState(null);

<div className="option-cards">
  {subscriptionPlans.map((plan) => (
    <BfDsCard
      key={plan.id}
      clickable
      selected={selectedOption === plan.id}
      onClick={() => setSelectedOption(plan.id)}
      variant="outlined"
      header={
        <div className="flex justify-between">
          <h3>{plan.name}</h3>
          <BfDsPill
            variant={plan.popular ? "primary" : "secondary"}
            text={plan.popular ? "Popular" : ""}
          />
        </div>
      }
      footer={
        <div className="text-center">
          <div className="text-2xl font-bold">${plan.price}/month</div>
        </div>
      }
    >
      <ul>
        {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
      </ul>
    </BfDsCard>
  ))}
</div>;
```

### Content Cards

```tsx
<div className="blog-cards">
  {blogPosts.map((post) => (
    <BfDsCard
      key={post.id}
      variant="outlined"
      clickable
      onClick={() => openPost(post.id)}
      header={
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      }
      footer={
        <div className="flex justify-between text-sm text-gray-500">
          <span>By {post.author}</span>
          <span>{post.date}</span>
        </div>
      }
    >
      <h2 className="text-xl font-bold">{post.title}</h2>
      <p className="text-gray-600">{post.excerpt}</p>
      <div className="flex gap-2 mt-2">
        {post.tags.map((tag) => (
          <BfDsPill key={tag} variant="secondary" text={tag} />
        ))}
      </div>
    </BfDsCard>
  ))}
</div>;
```

## Accessibility

BfDsCard includes accessibility features for clickable cards:

- **Keyboard Navigation** - Clickable cards are focusable with Tab
- **ARIA Attributes** - Uses `role="button"` and `aria-pressed` for clickable
  cards
- **Click Handlers** - Supports both mouse clicks and keyboard activation
- **Focus Management** - Clear visual focus indicators
- **Disabled State** - Proper handling of disabled interactions

### Best Practices

- Use descriptive header content for screen readers
- Ensure clickable cards have clear visual states
- Provide keyboard alternatives for all interactive elements
- Use semantic HTML within card content
- Test keyboard navigation thoroughly

## Styling Notes

BfDsCard uses CSS classes with the `bfds-card` prefix:

- `.bfds-card` - Base card styling
- `.bfds-card--{variant}` - Variant-specific styling
- `.bfds-card--{size}` - Size-specific styling
- `.bfds-card--clickable` - Interactive card styling
- `.bfds-card--selected` - Selected state styling
- `.bfds-card--disabled` - Disabled state styling
- `.bfds-card__header` - Header section styling
- `.bfds-card__body` - Main content area styling
- `.bfds-card__footer` - Footer section styling

The component automatically:

- Manages hover and focus states for clickable cards
- Provides consistent spacing across header, body, and footer
- Handles disabled state interactions appropriately
- Scales content appropriately for different sizes
- Maintains visual hierarchy with proper shadows and borders
