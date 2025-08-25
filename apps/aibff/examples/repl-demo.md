# aibff REPL Demo

This document demonstrates how to use the interactive REPL for creating graders.

## Prerequisites

1. Set up your OpenRouter API key:
   ```bash
   export OPENROUTER_API_KEY=your-api-key-here
   ```

   Or create a `.env.local` file:
   ```
   OPENROUTER_API_KEY=your-api-key-here
   ```

2. Build process is no longer required (deprecated)

## Starting a New Session

```bash
aibff repl
```

This will:

- Create a new session folder (e.g., `session-1736805600000/`)
- Initialize tracking files (`progress.md` and `conversation.md`)
- Start the interactive assistant

## Example Conversation

```
Welcome to aibff REPL!
Type 'exit' or 'quit' to end the session.

Session created: /path/to/session-1736805600000

Welcome! I'm here to help you create a grader for evaluating AI outputs. Could you tell me what kind of AI responses you'd like to evaluate? For example, are you working with customer support responses, code generation, content creation, or something else?

You: I want to evaluate customer support responses for quality and helpfulness

[Assistant responds with guidance on creating a customer support grader]

You: I have some example responses in a CSV file

[Assistant helps you format the samples and create the grader]

You: exit

Goodbye! Your session has been saved.
```

## Resuming a Session

List available sessions:

```bash
aibff repl --list
```

Resume a specific session:

```bash
aibff repl --resume session-1736805600000
```

## Session Structure

Each session creates the following files:

```
session-1736805600000/
├── progress.md          # Session state and metadata
├── conversation.md      # Full conversation history
├── grader.deck.md       # Your grader definition (created by assistant)
├── grader.deck.toml     # Grader configuration
├── samples.jsonl        # Formatted evaluation samples
└── results/             # Evaluation results (after running eval)
    ├── results.toml
    └── results.html
```

## Available Commands

The assistant can help you with:

1. **Gathering samples** - Format and prepare evaluation data
2. **Creating graders** - Define evaluation criteria and scoring
3. **Running evaluations** - Test your grader on samples
4. **Iterating** - Refine based on results

## Tips

- Be specific about your evaluation use case
- Provide diverse examples (both good and bad)
- Start with simple criteria and refine iteratively
- The assistant will create all necessary files for you
- Your conversation and work are automatically saved

## Without an API Key

If you don't have an OpenRouter API key, the REPL will still work but with
limited functionality (echo mode). You can:

- Create sessions
- View session history
- Practice the workflow

But you won't get AI assistance until you provide an API key.
