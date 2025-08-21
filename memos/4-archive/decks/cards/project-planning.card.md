# Project Planning and Management

This behavior card defines how we plan and manage projects when working with AI
agents. Our approach emphasizes conversational documentation that helps AI
quickly understand context while avoiding unnecessary structure.

## Document Structure

### Root README.md (User-focused)

Lives at the root of each folder and describes the purpose of the folder from a
user perspective. This helps anyone (human or AI) immediately understand how to
use the folder.

### docs/README.md (Developer-focused)

The main planning document that serves as the jumping off point for AI agents
and developers. This document captures the essence of our conversations and
decisions.

#### Standard Sections:

**What are we building?**

- Written in prose
- Clear description of the project/feature
- Keep it conversational and accessible

**Why do we need to build it?**

- Written in prose
- The philosophy, motivation, and user needs
- What problems we're solving

**Status**

| Task                 | Status                    | Description         |
| -------------------- | ------------------------- | ------------------- |
| [Current work items] | [Active/Complete/Blocked] | [Brief description] |

**Future work**

| Task             | Description             |
| ---------------- | ----------------------- |
| [Upcoming items] | [What needs to be done] |

**Measurement**

| Metric          | Purpose           | Description      |
| --------------- | ----------------- | ---------------- |
| [What we track] | [Why we track it] | [How we measure] |

### Supporting Documents

**BACKLOG.md**

| Task           | Type              | Description          |
| -------------- | ----------------- | -------------------- |
| [Future items] | bug/chore/feature | [What could be done] |

**Additional Resources** (within markdown files)

- Mermaid diagrams inline in markdown for architecture and flows
- Links to external resources (Figma, documentation, etc.)
- Reference URLs and citations
- Keep everything text-based (no binary files in source control)

## Best Practices

### Do:

- Create the README early, even with empty sections
- Write conversationally, especially in the first two sections
- Use tables for structured information (status, future work, metrics)
- Keep the README high-level and less technical
- Update documents as conversations with AI evolve
- Point AI to docs/README.md as the starting point

### Don't:

- Create structure for structure's sake
- Make documents overly formal or rigid
- Wait until everything is figured out to create docs
- Mix user documentation with developer planning

## Purpose

These documents exist to:

1. Capture conversations and decisions made with AI
2. Document philosophy, approaches, and taste
3. Provide quick context for AI agents
4. Track what we want to achieve and what to avoid
5. Make our taste and judgment tangible

Remember: The goal is to have an informal structure that documents
conversations, not to build structure or code on its own. Keep it simple and
conversational.
