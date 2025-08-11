# BfDs Style Guide

This document outlines the design standards and guidelines for the Bolt Foundry
Design System (BfDs).

## Text Capitalization Standards

### Sentence Case

**All UI text should use Sentence case** - where only the first word is
capitalized, along with proper nouns.

**✅ Correct Examples:**

- "Start trial"
- "Join waitlist"
- "Most popular"
- "Coming soon"
- "Contact sales"
- "Get started"

**❌ Incorrect Examples:**

- "Start Trial" (Title Case)
- "JOIN WAITLIST" (ALL CAPS)
- "most popular" (lowercase)

### Where to Apply Sentence Case:

- **Buttons**: "Save changes", "Delete item", "Start trial"
- **Labels**: "Email address", "First name", "Phone number"
- **Badges**: "Most popular", "Coming soon", "Recommended"
- **Headers**: "Account settings", "User profile", "Pricing plans"
- **Menu items**: "Dashboard", "Settings", "Help center"
- **Toast messages**: "Changes saved successfully", "Error occurred"
- **Form validation**: "This field is required", "Invalid email format"

### Exceptions:

- **Proper nouns**: "Bolt Foundry", "GitHub", "OpenAI"
- **Acronyms**: "API", "URL", "AI", "RLHF"
- **Brand names**: Product names and company names retain their original
  capitalization

## Implementation in Components

### Button Text

```tsx
// ✅ Correct
<BfDsButton>Save changes</BfDsButton>
<BfDsButton>Start trial</BfDsButton>

// ❌ Incorrect  
<BfDsButton>Save Changes</BfDsButton>
<BfDsButton>START TRIAL</BfDsButton>
```

### Badge Text

```tsx
// ✅ Correct
<BfDsBadge>Most popular</BfDsBadge>
<BfDsBadge>Coming soon</BfDsBadge>

// ❌ Incorrect
<BfDsBadge>Most Popular</BfDsBadge>
<BfDsBadge>COMING SOON</BfDsBadge>
```

### Form Labels

```tsx
// ✅ Correct
<BfDsInput label="Email address" />
<BfDsInput label="First name" />

// ❌ Incorrect
<BfDsInput label="Email Address" />
<BfDsInput label="First Name" />
```

## Rationale

Sentence case provides several benefits:

1. **Better Readability**: Sentence case is easier to read and scan quickly
2. **Accessibility**: Screen readers handle sentence case more naturally
3. **Modern Design**: Follows current design trends and best practices
4. **Consistency**: Creates a unified voice across all UI elements
5. **Professional**: Appears more conversational and less aggressive than Title
   Case or ALL CAPS

## Tools and Validation

When creating new components or updating existing ones:

1. **Review all text content** for sentence case compliance
2. **Test with screen readers** to ensure natural pronunciation
3. **Use linting tools** where available to catch capitalization issues
4. **Include sentence case examples** in component documentation

## Related Resources

- [Material Design Typography Guidelines](https://material.io/design/typography/understanding-typography.html)
- [Apple Human Interface Guidelines - Writing](https://developer.apple.com/design/human-interface-guidelines/writing)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/)
