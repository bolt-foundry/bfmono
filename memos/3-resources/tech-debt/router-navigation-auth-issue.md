# Router Navigation Authentication Issue

**Date**: 2025-08-08 **Component**: boltfoundry-com RouterContext **Impact**:
Authentication flow breaks when using client-side navigation

## Problem Description

The `RouterContext.navigate()` method uses `history.pushState()` for client-side
navigation, which is inappropriate for authentication flows that require a full
page reload to establish authenticated sessions.

## Technical Details

### Current Behavior

- `navigate()` uses `history.pushState()` which only updates the URL without
  triggering a page reload
- This prevents the server from reading newly set authentication cookies
- The Isograph environment retains the old unauthenticated state
- Components that depend on `currentViewer` being authenticated (like HUD) don't
  render

### Expected Behavior

- After successful authentication, the page should fully reload to:
  - Allow the server to read authentication cookies
  - Create a fresh `CurrentViewer` with authenticated state
  - Re-initialize the Isograph environment with proper authentication context

## Root Cause

The authentication flow works as follows:

1. User logs in via Google OAuth
2. Server sets authentication cookies (`bf_access`, `bf_refresh`)
3. Server responds with `{ redirectTo: "/eval" }`
4. Client needs to navigate to `/eval` with authenticated context

Using `pushState` navigation skips the critical server-side authentication setup
that happens during page load.

## Symptoms

- E2E tests fail for authenticated features (HUD functionality tests)
- Users appear logged out even after successful authentication
- Protected routes don't recognize authenticated users

## Proposed Solutions

### Option 1: Two Navigation Methods

Add a second method to RouterContext for full page navigations:

```typescript
navigateWithReload(path: string) {
  globalThis.location.href = path;
}
```

### Option 2: Navigation Options

Add options to the existing navigate method:

```typescript
navigate(path: string, options?: { reload?: boolean }) {
  if (options?.reload) {
    globalThis.location.href = path;
  } else {
    // existing pushState logic
  }
}
```

### Option 3: Revert Authentication Flow

Keep authentication flows using `location.href` directly, bypassing the router
for these specific cases.

## Temporary Workaround

Continue using `globalThis.location.href` for post-authentication redirects
instead of the router's `navigate()` method.

## Related Files

- `/apps/boltfoundry-com/contexts/RouterContext.tsx`
- `/apps/boltfoundry-com/components/LoginWithGoogleButton.tsx`
- `/apps/boltfoundry-com/handlers/googleAuth.ts`
- `/apps/bfDb/graphql/graphqlContext.ts`

## Test Cases Affected

- `apps/boltfoundry-com/__tests__/e2e/hud.test.e2e.ts`
- Any E2E tests that require authentication
