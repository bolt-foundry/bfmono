# BoltFoundry.com Routing System Enhancement

## Project Overview

This project focuses specifically on improving the routing system in the
`apps/boltfoundry-com/` application. Based on investigation of the current
implementation, this plan addresses critical gaps and proposes enhancements for
more robust routing functionality.

## Current State Analysis

### BoltFoundry.com Routing Implementation

**Location**: `apps/boltfoundry-com/`

**Architecture**: Dual routing system with custom implementation

- **Traditional React routes** (`appRoutes`): `/plinko`, `/ui`, `/ui/*`
- **Isograph-powered routes** (`isographAppRoutes`): `/`, `/login`, `/rlhf`,
  `/eval`

**Key Components**:

- `contexts/RouterContext.tsx` - Custom router context with navigation
- `routes.ts` - Route definitions for both systems
- `AppRoot.tsx` - Route resolution and component rendering
- `server.tsx` - Server-side route handling and SSR
- `components/RouterLink.tsx` - Navigation component

**Current Features**:

- Query parameter extraction
- Wildcard pattern support (`/ui/*`)
- Server-side rendering with route detection
- Development/production mode handling
- Static asset serving
- Basic route matching with `matchRouteWithParams`

## Critical Issues Identified

### 1. **Broken Route Parameter Extraction**

**Problem**: The `matchRouteWithParams` function doesn't extract parameter
values

- Routes like `/chat/:conversationId` are defined but parameters aren't
  extracted
- `routeParams` in RouterContext remains empty
- No actual parameter parsing implementation

**Impact**:

- Cannot access dynamic route segments
- Isograph entrypoints can't receive route parameters
- Limited dynamic routing capabilities

### 2. **Incomplete Route Matching**

**Current Implementation**:

```typescript
// Only handles exact matches and wildcard patterns
if (rawPath === pathTemplate) { /* exact match */ }
if (pathTemplate.endsWith("/*")) { /* wildcard */ }
// Missing: parameter extraction like :id, :slug, etc.
```

**Missing Features**:

- Parameter extraction (`:id`, `:slug`)
- Optional parameters (`:id?`)
- Multiple parameters (`/users/:id/posts/:postId`)

### 3. **Server-Client Route Handling Mismatch**

**Server-side** (`server.tsx`):

```typescript
// Basic regex replacement for parameterized routes
const routePattern = routePath.replace(/:[^/]+/g, "[^/]+");
```

**Client-side** (`RouterContext.tsx`):

```typescript
// No parameter extraction at all
return { match: false, params: {}, queryParams };
```

## Implementation Plan

### Phase 1: Fix Parameter Extraction (Priority: Critical)

**Timeline**: 3-5 days

#### 1.1 Enhanced `matchRouteWithParams` Function

**File**: `apps/boltfoundry-com/contexts/RouterContext.tsx`

```typescript
export function matchRouteWithParams(
  pathRaw = "",
  pathTemplate?: string,
): MatchedRoute {
  const [rawPath, search] = pathRaw.split("?");
  const searchParams = new URLSearchParams(search || "");
  const queryParams = Object.fromEntries(searchParams.entries());

  if (!pathTemplate) {
    return { match: false, params: {}, queryParams };
  }

  // Handle exact match
  if (rawPath === pathTemplate) {
    return { match: true, params: {}, queryParams };
  }

  // Handle wildcard patterns
  if (pathTemplate.endsWith("/*")) {
    const baseTemplate = pathTemplate.slice(0, -2);
    if (rawPath === baseTemplate || rawPath.startsWith(baseTemplate + "/")) {
      return { match: true, params: {}, queryParams };
    }
  }

  // NEW: Handle parameterized routes
  const templateParts = pathTemplate.split("/");
  const pathParts = rawPath.split("/");

  if (templateParts.length !== pathParts.length) {
    return { match: false, params: {}, queryParams };
  }

  const params: Record<string, string> = {};
  let matches = true;

  for (let i = 0; i < templateParts.length; i++) {
    const templatePart = templateParts[i];
    const pathPart = pathParts[i];

    if (templatePart.startsWith(":")) {
      // Extract parameter
      const paramName = templatePart.slice(1);
      params[paramName] = pathPart;
    } else if (templatePart !== pathPart) {
      matches = false;
      break;
    }
  }

  return {
    match: matches,
    params,
    queryParams,
  };
}
```

#### 1.2 Update RouterContext to Populate Parameters

**File**: `apps/boltfoundry-com/contexts/RouterContext.tsx`

```typescript
export function RouterProvider({ children, initialPath }: {
  children: React.ReactNode;
  initialPath?: string;
}) {
  const [currentPath, setCurrentPath] = useState(/* ... */);
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  // NEW: Update route params when path changes
  useEffect(() => {
    // Find matching route and extract parameters
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(currentPath, routePattern);
      if (match.match) {
        setRouteParams(match.params);
        setQueryParams(match.queryParams);
        break;
      }
    }
  }, [currentPath]);

  // ... rest of implementation
}
```

#### 1.3 Test Parameter Extraction

**File**: `apps/boltfoundry-com/__tests__/routing.test.ts` (new)

```typescript
import { matchRouteWithParams } from "../contexts/RouterContext.tsx";

describe("Route Parameter Extraction", () => {
  it("should extract single parameter", () => {
    const result = matchRouteWithParams("/users/123", "/users/:id");
    expect(result).toEqual({
      match: true,
      params: { id: "123" },
      queryParams: {},
    });
  });

  it("should extract multiple parameters", () => {
    const result = matchRouteWithParams(
      "/users/123/posts/456",
      "/users/:userId/posts/:postId",
    );
    expect(result).toEqual({
      match: true,
      params: { userId: "123", postId: "456" },
      queryParams: {},
    });
  });
});
```

### Phase 2: Route Definition Enhancement (Priority: High)

**Timeline**: 2-3 days

#### 2.1 Add Parameterized Routes

**File**: `apps/boltfoundry-com/routes.ts`

Based on the eval routing specification, add these specific eval routes:

```typescript
// Simplified eval routing - single entrypoint handles all eval routes
export const isographAppRoutes = new Map<string, IsographRoute>([
  ["/", entrypointHome],
  ["/login", entrypointLogin],
  ["/rlhf", entrypointRlhf],

  // Eval System Routes - All handled by single entrypoint
  ["/eval", entrypointEval], // Eval landing page
  ["/eval/decks", entrypointEval], // Decks list view
  ["/eval/decks/:deckId", entrypointEval], // Deck overview
  ["/eval/decks/:deckId/sample/:sampleId", entrypointEval], // Sample view
  ["/eval/decks/:deckId/grading", entrypointEval], // Grading view

  // Fullscreen Routes - Same entrypoint, different layout mode
  ["/deck/:deckId", entrypointEval], // Fullscreen deck view
  ["/deck/:deckId/sample/:sampleId", entrypointEval], // Fullscreen sample view
  ["/deck/:deckId/grading", entrypointEval], // Fullscreen grading view
]);
```

**Layout Behavior by Route Pattern**:

**Normal Mode** (`/eval/*`):

- ✅ Left Sidebar: Visible/docked
- ✅ MainContent: Visible (DecksView on `/eval/decks`)
- ✅ RightSidebar: Shows deck/sample/grading content
- 🔄 Toggle Button: Maximize icon → switches to fullscreen equivalent

**Fullscreen Mode** (`/deck/*`):

- 🔒 Left Sidebar: Hidden (can overlay when toggled)
- 🔒 MainContent: Hidden (appears with sidebar overlay)
- ↔️ RightSidebar: Full width, shows same content as normal mode
- 🔄 Toggle Button: Minimize icon → switches to normal equivalent
- 📱 Sidebar Toggle: Opens sidebar + main content as overlay

**Single Entrypoint Approach**:

The existing `entrypointEval` will handle all eval routes by:

- Receiving `deckId`, `sampleId` parameters from the router
- Using route parameters to determine what content to display
- Handling layout mode switching through the RouterContext
- Loading appropriate components (DecksView, DeckOverview, SampleView,
  GradingView) based on available parameters

**Route Parameter Logic**:

- No parameters: Show eval landing page
- No `deckId`: Show decks list (DecksView)
- `deckId` only: Show deck overview
- `deckId` + `sampleId`: Show sample view
- `deckId` + path contains "grading": Show grading interface

#### 2.2 Update Server-Side Route Matching

**File**: `apps/boltfoundry-com/server.tsx`

Update `shouldHandleWithReact` to use the same parameter extraction logic:

```typescript
function shouldHandleWithReact(pathname: string): boolean {
  // Check exact matches first
  if (isographAppRoutes.has(pathname) || appRoutes.has(pathname)) {
    return true;
  }

  // Use the same parameter matching logic as client-side
  for (const [routePath] of [...isographAppRoutes, ...appRoutes]) {
    const match = matchRouteWithParams(pathname, routePath);
    if (match.match) {
      return true;
    }
  }

  return false;
}
```

### Phase 3: Integration & Testing (Priority: Medium)

**Timeline**: 2-3 days

#### 3.1 Isograph Parameter Integration

Ensure extracted parameters are passed to Isograph entrypoints in `AppRoot.tsx`:

```typescript
// Parameters are already merged in AppRoot.tsx
const params = { ...routerProps.routeParams, ...routerProps.queryParams };
```

#### 3.2 Comprehensive Testing

- Unit tests for parameter extraction
- Integration tests for route navigation
- E2E tests for dynamic routes

#### 3.3 Enhanced EntrypointEval Implementation

**Update existing entrypoint** to handle all eval routes:

```typescript
// apps/boltfoundry-com/entrypoints/EntrypointEval.ts
export const entrypointEval = iso`
  entrypoint Query.EntrypointEval($deckId: ID, $sampleId: ID) {
    // All data needed for eval system - conditionally loaded based on parameters
    decks @loadable {
      id
      name
      // ... deck fields
    }
    
    deck(id: $deckId) @loadable {
      id
      name
      samples {
        id
        // ... sample fields
      }
      // ... deck fields
    }
    
    sample(id: $sampleId) @loadable {
      id
      content
      deck {
        id
        name
      }
      // ... sample fields
    }
  }
`;
```

**Component Logic** (in the Eval component):

```typescript
export function Eval(
  { deckId, sampleId }: { deckId?: string; sampleId?: string },
) {
  const { layoutMode, currentPath } = useRouter();

  // Determine what to show based on route parameters
  const showDecksView = !deckId;
  const showSampleView = deckId && sampleId;
  const showGradingView = deckId && currentPath.includes("/grading");
  const showDeckOverview = deckId && !sampleId && !showGradingView;

  return (
    <EvalLayout>
      {showDecksView && <DecksView />}
      {showDeckOverview && <DeckOverview deckId={deckId} />}
      {showSampleView && <SampleView deckId={deckId} sampleId={sampleId} />}
      {showGradingView && <GradingView deckId={deckId} />}
    </EvalLayout>
  );
}
```

#### 3.4 Layout Mode Detection & Toggle Implementation

**Add layout mode detection to RouterContext**:

```typescript
// apps/boltfoundry-com/contexts/RouterContext.tsx

export type LayoutMode = "normal" | "fullscreen";

export function getLayoutMode(pathname: string): LayoutMode {
  return pathname.startsWith("/deck/") ? "fullscreen" : "normal";
}

export function toggleLayoutMode(currentPath: string): string {
  if (currentPath.startsWith("/eval/decks/")) {
    // Convert /eval/decks/abc123/sample/xyz789 → /deck/abc123/sample/xyz789
    return currentPath.replace("/eval/decks/", "/deck/");
  } else if (currentPath.startsWith("/deck/")) {
    // Convert /deck/abc123/sample/xyz789 → /eval/decks/abc123/sample/xyz789
    return currentPath.replace("/deck/", "/eval/decks/");
  }
  return currentPath;
}

// Add to RouterContextType
type RouterContextType = {
  currentPath: string;
  navigate: (path: string) => void;
  routeParams: Record<string, string>;
  queryParams: Record<string, string>;
  layoutMode: LayoutMode; // NEW
  toggleLayoutMode: () => void; // NEW
};
```

**Layout-aware component structure**:

```typescript
// apps/boltfoundry-com/components/layouts/EvalLayout.tsx

export function EvalLayout({ children }: { children: React.ReactNode }) {
  const { layoutMode, currentPath } = useRouter();
  const [sidebarOverlayOpen, setSidebarOverlayOpen] = useState(false);

  const showLeftSidebar = layoutMode === "normal";
  const showMainContent = layoutMode === "normal" || sidebarOverlayOpen;

  return (
    <div className="eval-layout">
      <LeftSidebar
        visible={showLeftSidebar}
        overlay={layoutMode === "fullscreen" && sidebarOverlayOpen}
        onClose={() => setSidebarOverlayOpen(false)}
      />
      <MainContent
        visible={showMainContent}
        overlay={layoutMode === "fullscreen"}
      />
      <RightSidebar
        fullWidth={layoutMode === "fullscreen" && !sidebarOverlayOpen}
      >
        {children}
      </RightSidebar>
    </div>
  );
}
```

#### 3.5 Documentation Update

- Update routing documentation
- Add examples of parameterized routes
- Document parameter access patterns
- Document new eval system navigation flow
- Document layout mode switching behavior

## Success Metrics

### Immediate Goals

- [ ] Route parameters correctly extracted from URLs like `/eval/:evalId`
- [ ] `routeParams` populated in RouterContext
- [ ] Isograph entrypoints receive dynamic parameters
- [ ] Server-side and client-side route matching consistent

### Validation Tests

#### Core Parameter Extraction

- [ ] Navigate to `/eval/decks/deck123` extracts `deckId: "deck123"`
- [ ] Navigate to `/eval/decks/deck123/sample/sample456` extracts
      `deckId: "deck123"` and `sampleId: "sample456"`
- [ ] Short routes work: `/deck/deck123` extracts `deckId: "deck123"`
- [ ] Query parameters still work alongside route parameters

#### Eval System Route Tests

- [ ] `/eval` - Eval landing page loads
- [ ] `/eval/decks` - Decks list page loads
- [ ] `/eval/decks/:deckId` - Deck overview with `deckId` parameter
- [ ] `/eval/decks/:deckId/sample/:sampleId` - Sample view with both parameters
- [ ] `/eval/decks/:deckId/grading` - Grading interface with `deckId` parameter

#### Short Route Aliases

- [ ] `/deck/:deckId` - Same as `/eval/decks/:deckId`
- [ ] `/deck/:deckId/sample/:sampleId` - Same as full eval path
- [ ] `/deck/:deckId/grading` - Same as full eval grading path

#### Server-Side Rendering

- [ ] SSR works with all parameterized eval routes
- [ ] Direct URL access works for all routes
- [ ] Browser refresh preserves route parameters

#### Layout Mode Switching

- [ ] Toggle button correctly switches `/eval/decks/abc123` ↔ `/deck/abc123`
- [ ] Toggle button correctly switches `/eval/decks/abc123/sample/xyz789` ↔
      `/deck/abc123/sample/xyz789`
- [ ] Fullscreen mode hides sidebar and main content by default
- [ ] Sidebar toggle in fullscreen mode shows overlay with both sidebar and main
      content
- [ ] Layout mode detection works correctly for all route patterns
- [ ] Navigation preserves layout mode when moving between related routes

## Technical Notes

### Maintaining Backward Compatibility

- All existing routes continue to work
- No breaking changes to current navigation
- Gradual enhancement approach

### Performance Considerations

- Parameter extraction is O(n) where n = number of route segments
- Caching route matches if performance becomes an issue
- Keep existing exact match optimizations

## Future Enhancements (Out of Scope)

After core parameter extraction is working:

- Route guards for authentication
- Nested routing support
- Route-based code splitting
- Enhanced TypeScript support

## Conclusion

This focused enhancement addresses the critical gap in route parameter
extraction for the BoltFoundry.com app. The implementation maintains the
existing dual routing architecture while adding essential dynamic routing
capabilities needed for modern web application navigation.

The phased approach ensures minimal risk while delivering immediate value
through proper parameter extraction and improved route matching capabilities.
