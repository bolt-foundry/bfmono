# Deck Leads

Leads are transitional text elements in decks that provide context,
explanations, and flow between specs and cards. They help create a more natural,
readable structure for deck specifications.

## Purpose

Leads serve as connective tissue in decks, but more importantly, they help
maintain the LLM's attention flow:

- **Focus attention**: Leads guide the LLM's attention to the right context
  before presenting specs
- **Reduce distraction**: By providing clear transitions, leads prevent the LLM
  from getting confused between different sections
- **Maintain coherence**: Leads help the LLM understand relationships between
  different parts of the deck
- **Provide context**: They explain the "why" before the "what", helping the LLM
  better interpret specs

Without leads, an LLM might struggle to understand which specs belong together
or how different sections relate to each other. Leads act as cognitive anchors
that keep the LLM's attention flowing in the intended direction.

## Types of Leads

### Deck Introduction Lead

A paragraph immediately after the H1 header introduces the entire deck:

```markdown
# My Assistant Deck

This lead explains the overall purpose and context of the deck.

## First Card

...
```

### Card Introduction Lead

A paragraph immediately after an H2 or H3 header explains what that card
contains:

```markdown
## Persona Card

This lead introduces the persona card and its purpose.

- Specific trait one
- Specific trait two
```

### Jump-Out Lead

A paragraph after specs within a card provides transition or additional context:

```markdown
## Communication Style

- Be clear and concise
- Use active voice

This lead provides additional context or transitions to the next concept.
```

### Transitional Lead (Deck Level)

Paragraphs between cards at the deck level provide transitions:

```markdown
# Deck Name

Initial deck introduction.

## First Card

- Some specs

## Second Card

- More specs
```

Note: Currently, paragraphs between cards are treated as jump-out leads within
the preceding card.

## Builder API

### Using DeckBuilder

```typescript
const deck = makeDeckBuilder("my-deck")
  .lead("This deck demonstrates lead functionality")
  .spec("A top-level spec")
  .lead("Transition to the first card")
  .card("persona", (c) =>
    c.lead("This card defines the persona")
      .spec("Helpful and friendly")
      .lead("Additional context about the persona"));
```

### Using CardBuilder

```typescript
const card = makeCardBuilder()
  .lead("Introduction to this card")
  .spec("First specification")
  .spec("Second specification")
  .lead("Concluding thoughts or transition");
```

## Markdown Syntax

In markdown deck files, leads are simply paragraphs in specific positions:

```markdown
# Technical Writer Deck

This paragraph becomes a deck introduction lead.

## Writing Guidelines

This paragraph becomes a card introduction lead.

- Write clearly
- Be concise

This paragraph becomes a jump-out lead after the specs.

### Subsection

Leads work at any nesting level.

- More specs here
```

## Best Practices

### Do:

- Use leads to provide context and improve readability
- Keep leads concise and focused
- Use leads to explain the "why" behind specs
- Place leads strategically for natural flow

### Don't:

- Make leads too long or detailed
- Use leads as a replacement for proper specs
- Include formatting or complex structures in leads
- Overuse leads - not every section needs one

## Rendering

Leads are rendered as plain text in the final output:

```
This is a lead providing context.
- This is a spec
Another lead for transition.
<card-name>
  Card introduction lead.
  - Spec within card
</card-name>
```

## Examples

### Simple Deck with Leads

```markdown
# Assistant Configuration

This deck configures an AI assistant for customer support.

## Personality

The assistant should be professional yet approachable.

- Empathetic and understanding
- Patient with user questions
- Professional tone

Remember to maintain consistency across all interactions.

## Knowledge Base

Define what the assistant knows.

- Product specifications
- Common troubleshooting steps
- Company policies
```

### Nested Structure with Leads

```markdown
# Complex System

Overview of the system architecture.

## Core Components

These are the essential building blocks.

### Database Layer

Handles all data persistence.

- PostgreSQL for relational data
- Redis for caching

The database layer is critical for performance.

### API Layer

Manages external communication.

- RESTful endpoints
- GraphQL for complex queries
```

## Technical Notes

- Leads are stored in the `lead` field of Card objects
- Empty cards with only a lead have `value: ""`
- Leads maintain their position in the card/deck structure
- The parser identifies leads based on their position in the markdown AST
