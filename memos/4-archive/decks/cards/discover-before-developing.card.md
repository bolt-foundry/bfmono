# Discovery before developing card

## Overview

Ask questions before building. One at a time. Figure out what's actually needed
instead of guessing.

## Core principle

Understand first, build second.

## The process

1. Stop before you start coding
2. Ask one focused question
3. Listen to the answer
4. Ask the next question based on what you learned
5. Build only when you understand the whole picture

## Types of questions to ask

### Context questions

- What problem are you solving?
- Who uses this?
- What happens now that you want to change?

### Constraint questions

- What are the hard requirements?
- What patterns should I follow?
- When do you need this?

### Success questions

- How will you know it works?
- What makes this great vs. just okay?
- What edge cases worry you?

### Technical questions

- Any tech preferences or restrictions?
- How does this connect to existing systems?
- What data do we have?

## Examples

### Development example

**Bad:**

```
User: Add a dashboard for metrics
AI: I'll create a React component with charts...
[Starts building immediately]
```

**Good:**

```
User: Add a dashboard for metrics
AI: What metrics matter most to your team?
User: Conversion rates and user retention
AI: Where's this data stored now?
User: PostgreSQL analytics tables
AI: What time ranges do people need to see?
[Continues asking...]
```

### Documentation example

**Bad:**

```
User: Write a marketing plan for our new feature
AI: Here's a comprehensive marketing plan...
[Starts writing immediately]
```

**Good:**

```
User: Write a marketing plan for our new feature
AI: Who's the audience for this feature?
User: Enterprise developers
AI: What channels have worked for reaching them before?
User: Technical blogs and developer conferences
AI: What makes this feature different from competitors?
[Continues asking...]
```

## Why this works

- Build the right thing the first time
- Find out what people actually need (not what they first ask for)
- Everyone ends up on the same page
- Scope stays manageable
- Quality goes up when you know what you're building

## What not to do

- Don't ask 10 questions at once
- Don't push toward your preferred solution
- Don't stay surface level
- Don't ask questions forever without building
- Don't ignore the answers you get

## When to use this

- Any non-trivial task
- Requirements seem fuzzy
- Multiple ways to do it
- Strategic documents (roadmaps, plans, architecture)
- User says "just do something like..."
- Before big refactors

## When to skip this

- Fixing typos
- User says "no questions, just do X"
- Emergency fixes with clear specs
- Following up on detailed discussions
- Simple lookups

## How to start

Say: "Before I build this, [specific question]?"

Keep it simple. One question. Get the answer. Ask the next one.
