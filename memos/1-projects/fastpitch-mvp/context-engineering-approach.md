# Context Engineering Approach for Fastpitch

## Overview

We're following the
[Hourglass Principle](https://contexteng.ai/p/context-engineering-101-the-hourglass)
for designing our Fastpitch AI decks. This approach treats prompts like human
communication - starting broad and narrowing to specifics.

## Core Principles

### 1. Inverted Information Hierarchy

Structure prompts from least to most important:

```
Background/Context (Broad)
    ↓
General Requirements
    ↓
Specific Instructions
    ↓
Critical Details (Narrow)
```

- Start with who/why before what/how
- Place most critical instructions at the end
- Build context gradually like a briefing

### 2. Synthetic User Turns

Instead of system prompts with variables:

**❌ Bad:**

```markdown
You are analyzing sports stories for {{team_name}} on {{date}}.
```

**✅ Good:**

```markdown
System: You are a sports analyst.

User: I need analysis of Lakers stories from today. Assistant: I'll analyze
Lakers stories...
```

Key practices:

- Use message arrays to simulate conversation
- Never include variables directly in system prompts
- Create synthetic turns to provide nuanced context
- Let the AI ask precise questions through simulated dialogue

### 3. Dossier vs Recipe

**Dossier Approach (Preferred):**

- Guide with context like a briefing document
- Provide background and let AI leverage its training
- Focus on the "why" and desired outcome

**Recipe Approach (Avoid):**

- Step-by-step rigid instructions
- Over-specified implementation details
- Fighting against the model's natural capabilities

## Implementation for Fastpitch

### Deck Structure Example

```markdown
# Sports Story Analyst

## Background

You help sports fans stay informed about their favorite teams.

## Context

Sports fans are busy and need quick, relevant summaries of the most important
stories about their teams.

## Your Role

You analyze sports news to identify the most significant stories based on:

- Game results and implications
- Player updates and injuries
- Team strategy changes
- Trade rumors and confirmations

## Output Requirements

Select the top 5 most important stories and provide:

1. Story headline
2. One-sentence summary
3. Importance score (1-10)
4. Why this matters to fans

## Critical Instructions

- Focus only on stories from the last 24 hours
- Prioritize game results over speculation
- Always verify story dates before including
```

### Variable Injection Pattern

When we need to inject specific data (team, date, etc.), use synthetic user
turns:

```typescript
const messages = [
  { role: "system", content: deckContent },
  { role: "user", content: `Analyze stories for the Lakers from ${date}` },
  {
    role: "assistant",
    content: "I'll analyze Lakers stories from that date...",
  },
  { role: "user", content: `Here are the stories:\n${storiesCSV}` },
];
```

## Best Practices

1. **Prompt Caching**: Keep system prompts consistent to leverage caching
2. **Soften Parameters**: Use "typically" or "usually" instead of "always" or
   "never"
3. **Progressive Disclosure**: Reveal complexity gradually through the
   conversation
4. **Natural Language**: Write like you're briefing a human expert, not
   programming a computer

## Testing Approach

1. Start with minimal context and see what the AI produces
2. Add constraints only where the output diverges from requirements
3. Test with various inputs to ensure robustness
4. Verify that synthetic turns properly guide the AI

## References

- [Context Engineering 101: The Hourglass Principle](https://contexteng.ai/p/context-engineering-101-the-hourglass)
- [Inverted Pyramid Writing](https://en.wikipedia.org/wiki/Inverted_pyramid_(journalism))
- Bolt Foundry Deck System Documentation
