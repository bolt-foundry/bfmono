# Codebot Workspace Restructure Implementation

## Summary

Restructure the codebot container workspace to simplify the directory structure
and improve the development workflow by consolidating everything under @bfmono
with @internalbf-docs as an optional git submodule.

## Current State (As of 2025-08-01)

### What's Been Done

- ✅ @internalbf-docs exists at `/@bfmono/memos/@internalbf-docs/` in the
  expected location
- ✅ Directory structure supports the proposed layout
- ✅ Git submodule is set up and working

### What Still Needs Work

- ❌ Codebot still mounts two separate volumes:
  - `${workspacePath}/@bfmono` → `/@bfmono`
  - `${workspacePath}/@internalbf-docs` → `/@internalbf-docs`
- ❌ Working directory is not explicitly set
- ❌ Still copies internalbf-docs separately instead of using git submodule
- ❌ `.claude` file in @bfmono expects certain directory structure
- ❌ No TypeScript implementation for enhanced `bft commit` with submodule
  support
- ❌ No `bft amend` command implementation

## Proposed Changes

### 1. Directory Structure

Move to a single-root structure:

```
/@bfmono/                       # Container working directory
├── .claude                     # Configuration file
├── memos/
│   └── @internalbf-docs/      # Git submodule (optional)
└── ... (rest of @bfmono)
```

### 2. Git Submodule Setup ✅ COMPLETED

- @internalbf-docs is already set up as a git submodule at
  `memos/@internalbf-docs`
- Submodule remains optional - OSS users get empty directory
- Internal users with access can initialize: `git submodule update --init`

### 3. Codebot Script Updates (PRIMARY GOAL)

Update `infra/bft/tasks/codebot.bft.ts` to:

- Mount only `${workspacePath}` → `/` (single root mount)
- Set working directory to `/@bfmono`
- Remove separate @internalbf-docs volume mount (lines 134-136)
- Remove separate @internalbf-docs copying logic (lines 514-547, 619-637)
- The submodule at `/@bfmono/memos/@internalbf-docs` will be accessible via the
  single mount

### 4. Enhanced Commit Workflow

Extend existing `bft commit` deck (currently AI-powered) with TypeScript
implementation to:

- Detect if changes exist in submodules
- Commit submodule changes first
- Update parent repo's submodule pointer
- Provide single command for complete commit workflow

Also create `bft amend` command to:

- Amend commits in both main repo and submodules when needed
- Automatically handle submodule pointer updates when amending
- Simplify the workflow for updating commits

## Implementation Steps

### Priority 1: Update Codebot Script (Single Root Mount)

This is the main goal - simplify to a single mount point:

1. **Update codebot.bft.ts volume mounts**:
   ```typescript
   // Change from:
   "--volume", `${workspacePath}/@bfmono:/@bfmono`,
   "--volume", `${workspacePath}/@internalbf-docs:/@internalbf-docs`,

   // To:
   "--volume", `${workspacePath}:/`,
   "-w", "/@bfmono",  // Set working directory
   ```

2. **Remove @internalbf-docs copying logic**:
   - Delete lines that pull/copy @internalbf-docs separately
   - The submodule at `/@bfmono/memos/@internalbf-docs` will be available
     automatically

### Priority 2: Enhanced Tooling

1. **Enhance bft commit command**
   - Create TypeScript implementation: `infra/bft/tasks/commit.bft.ts`
   - Extend existing deck functionality
   - Handle submodule detection and commits

2. **Create bft amend command**
   - New file: `infra/bft/tasks/amend.bft.ts`
   - Handle amendments in both main repo and submodules
   - Automatic submodule pointer updates

## Benefits

- Simpler directory structure
- `.claude` file works naturally with relative paths
- Single volume mount
- Optional internal docs for OSS users
- Cleaner workspace management

## Risks & Mitigations

- **Risk**: Forgetting to commit submodule pointer updates
- **Mitigation**: `bft commit` command handles this automatically

- **Risk**: OSS users confused by empty submodule directory
- **Mitigation**: Add README in memos/ explaining optional submodules

## Testing Plan

1. Create test workspace with new structure
2. Verify codebot starts correctly
3. Test with and without submodule initialized
4. Verify `.claude` file recognizes full project structure
5. Test `bft commit` with submodule changes
