# Writing style card

## Overview

Binary rules for consistent writing. No interpretation needed - just follow
these rules.

## Capitalization

### Always use sentence case

- Headers: "Build reliable systems" not "Build Reliable Systems"
- Titles: "Getting started guide" not "Getting Started Guide"
- Buttons: "Save changes" not "Save Changes"
- Only capitalize proper nouns and first word

### Never use ALLCAPS

- Exception: Acronyms (API, URL, SDK)
- Exception: UNBREAK NOW!! (established term)

## Punctuation

### Always use Oxford comma

- "We support Python, JavaScript, and TypeScript"
- Not: "We support Python, JavaScript and TypeScript"

### Never use em dashes (—)

- Use colons instead: "Two options: build or buy"
- Use commas instead: "The system, which is complex, works well"
- Use periods for separate thoughts

### Avoid semicolons

- Use periods instead
- Make two sentences

### Single space after periods

- "This is correct. Next sentence."
- Not: "This is wrong. Two spaces."

## Numbers

### Spell out one through nine

- "We have three options"
- "There are nine steps"

### Use numerals for 10 and above

- "We tested 15 scenarios"
- "It takes 30 seconds"

### Always use numerals for:

- Versions: "v0.1.0" or "version 2"
- Percentages: "5% failure rate"
- Code/config: "Set timeout to 5 seconds"

## Lists

### Use bullets for unordered lists

- First item
- Second item
- Third item

### Use numbers for sequential steps

1. First do this
2. Then do that
3. Finally do this

### Capitalize first word of each item

- Even in bullet lists
- Like this one
- See?

## Code references

### Use backticks for inline code

- Reference `functionName()` in text
- Mention the `config.yaml` file
- The `--verbose` flag

### Use code blocks for multiple lines

```typescript
function example() {
  return true;
}
```

## File paths

### Always use forward slashes

- `/home/user/project`
- `src/components/Button.tsx`
- Never backslashes, even on Windows

### Start with slash for absolute paths

- `/apps/bfDb/classes/BfNode.ts`

### No slash for relative paths

- `docs/README.md`
- `../shared/utils.ts`

## Contractions

### Use them

- "It's" not "it is"
- "Don't" not "do not"
- "We'll" not "we will"
- Exception: emphasis ("Do NOT delete")

## Spacing

### No double spaces

- Not in sentences
- Not between words
- Not after punctuation

### Line breaks

- Single blank line between sections
- No trailing whitespace
- End files with single newline

## Common terms

### One word

- metadata (not meta-data)
- filesystem (not file system)
- codebase (not code base)
- backend (not back-end)
- frontend (not front-end)

### Two words

- end user (not end-user)
- machine learning (not machine-learning)
- open source (not open-source when used as noun)

### Hyphenated as adjective only

- "Open-source software" but "It's open source"
- "Machine-learning model" but "We use machine learning"

## Avoid

### Never use

- "e.g." - use "for example"
- "i.e." - use "that is" or rephrase
- "etc." - be specific or say "and more"
- "via" - use "through" or "using"

### Don't use

- "Utilize" - use "use"
- "Leverage" - use "use" or specific verb
- "Enable" as a noun - "enablement" is not a word we use

## Dates and times

### Dates

- January 29, 2025 (full context)
- Jan 29 (short form)
- 2025-01-29 (ISO format in code/data)

### Times

- 3:00 PM (not 3PM or 3:00PM)
- 24-hour in code: 15:00
- Include timezone when relevant: 3:00 PM PST

## Remember

These are rules, not guidelines. When in doubt, check this card.
