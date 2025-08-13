# BFT Commit and Claudify System Improvements

**Date**: 2025-08-01\
**Author**: Claude + User\
**Status**: Planning

## Problem Statement

The current bft commit command and claudify system have several issues:

1. **Long descriptions in slash menu**: The commit command shows its entire
   pre-commit workflow instructions as the description, making the slash menu
   unwieldy
2. **No separation of concerns**: Description, content, and help text are
   conflated
3. **Duplicative generated files**: The claudify system creates redundant Claude
   command files

## Requirements

Based on 1qaat discovery:

1. **Slash command description**: Should be brief like "Runs pre-checks, creates
   commit, and submits it"
2. **Pre-commit instructions**: Should be part of the command's content
   (executed every time)
3. **New field approach**: Add a `shortDescription` field to task definitions
   for slash menu display

## Proposed Changes

### 1. Update TaskDefinition Interface

```typescript
export interface TaskDefinition {
  description: string; // Full description for help command
  shortDescription?: string; // Brief description for slash menu (new)
  fn: (args: Array<string>) => number | Promise<number>;
}
```

### 2. Update Commit Task

```typescript
export const bftDefinition = {
  shortDescription: "Runs pre-checks, creates commit, and submits it",
  description: "Create commits with automatic submodule handling",
  fn: commit,
} satisfies TaskDefinition;
```

The full pre-commit workflow instructions would move into the generated Claude
command content.

### 3. Update Claudify Logic

The claudify command should:

- Use `shortDescription` for the frontmatter description (if available)
- Fall back to `description` if `shortDescription` is not provided
- Put the full workflow instructions in the command content

### 4. Generated Command Structure

Example generated `/commit.md`:

```markdown
---
name: bft-commit
description: Runs pre-checks, creates commit, and submits it
---

Create commits with automatic submodule handling.

IMPORTANT: Before creating any commit, you MUST:

1. Use TodoWrite to create tasks for: 'Run bft check', 'Run bft lint', 'Run bft
   test', 'Run bft format', 'Execute bft commit'
2. Use the Task tool with subagent_type: 'general-purpose' to run the first
   three tasks (check, lint, test) in PARALLEL
3. After all three parallel tasks are completed and all issues are fixed, run
   'bft format'
4. Only after format is complete and ALL todos are marked as completed, execute
   bft commit command
```

## Implementation Plan

1. Update `infra/bft/bft.ts` to add `shortDescription` to TaskDefinition
2. Update `infra/bft/tasks/commit.bft.ts` to use new structure
3. Update `infra/bft/tasks/claudify.bft.ts` to use shortDescription in
   frontmatter
4. Update other tasks that would benefit from shorter descriptions
5. Test the changes with `bft claudify` to regenerate commands

## Open Questions

- Should we make `shortDescription` required for all tasks?
- Should we add validation to ensure shortDescription is actually short (e.g., <
  80 chars)?
- Do we need to update the help command to show both descriptions?
