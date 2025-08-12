# Phase 1: Browser Login and Get API Key

## Overview

Extend the existing eval.test.e2e.ts to navigate to the settings page after
login and extract an API key for use in backend operations.

## Requirements

- Extend existing login flow in eval test
- Navigate to /settings after successful authentication
- Extract API key from the page
- Store API key for use in subsequent test steps

## Implementation Details

### Research Findings

- **Current test location**:
  `/internalbf/bfmono/apps/boltfoundry-com/__tests__/e2e/eval.test.e2e.ts`
- **UI interaction pattern**: Uses `smoothClick` for realistic user interactions
- **No existing /settings route**: Will need to be added as part of Phase 0
- **Authentication flow**: Uses Google OAuth with mock responses

### Shared Data

**Expects from previous phases:** None (this is the first phase)

**Provides to next phases:**

- `extractedApiKey: string` - The API key extracted from the settings page

See [shared-data-spec.md](./shared-data-spec.md) for complete data flow.

### Test Flow

1. **Use Existing Login Flow**
   - Keep current Google OAuth login process
   - Verify successful authentication

2. **Navigate to Settings**
   ```typescript
   // Click on settings link in navigation
   await smoothClick(
     context.page,
     "nav a[href='/settings'], nav button:has-text('Settings')",
     "Settings navigation link",
   );

   // Wait for settings page to load
   await context.page.waitForSelector(".api-keys-section", {
     visible: true,
     timeout: 10000,
   });
   ```

3. **Extract API Key**
   ```typescript
   // Find the first API key input field
   const apiKeyInput = await context.page.$("input.api-key-field");
   const apiKey = await apiKeyInput.evaluate((el) => el.value);

   // Store in shared state (declared in main test function)
   extractedApiKey = apiKey;
   ```

4. **Verify Key Format**
   - Check that key starts with "bf+"
   - Ensure it includes organization ID

### Error Handling

- Handle case where no API keys exist
- Add retry logic for page navigation
- Clear error messages if settings page fails to load

## Success Criteria

- [ ] Test successfully navigates to settings after login
- [ ] API key extracted from input field
- [ ] Key format validated (bf+{orgId})
- [ ] Key stored for use in Phase 2
- [ ] Appropriate error handling added

## Dependencies

- Phase 0 must be complete (API keys page exists)
- Settings page must be accessible post-login

## Next Steps

With the API key extracted, Phase 2 can use it to create a BfClient instance and
generate samples.
