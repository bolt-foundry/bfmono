# BFMono Monorepo Structure

This document provides an overview of the Bolt Foundry monorepo organization and
its key components.

## Repository Layout

The monorepo follows a structured approach to organize different types of code
and documentation:

```
bfmono/
├── apps/           # Main applications and services
├── packages/       # Reusable TypeScript packages
├── infra/          # Build tools and infrastructure
├── docs/           # User and developer reference documentation
├── memos/          # Time-sensitive decisions and plans (PARA method)
└── shared/         # Team collaboration and host environment exchange
```

## Core Directories

### `/apps`

Contains the main applications that make up the Bolt Foundry platform:

- **aibff/** - AI feedback and evaluation CLI tool for LLM testing
- **bfDb/** - Database layer with GraphQL API (the data backbone)
- **bfDs/** - Design system components for consistent UI
- **boltFoundry/** - Main web application for customer success workflows
- **boltfoundry-com/** - Marketing website and public-facing content

### `/packages`

Shared TypeScript packages used across applications:

- **bolt-foundry/** - Core library and client SDK
- **logger/** - Centralized logging utilities
- **get-configuration-var/** - Configuration management system
- **aibff/** - AI feedback package (shared logic)
- **tui/** - Terminal user interface utilities

### `/infra`

Infrastructure and build tooling:

- **bft/** - Bolt Foundry Tool (task runner and automation)
- **lint/** - Custom linting rules and configurations
- **docker/** - Container configurations

## Technology Stack

- **Runtime**: Deno 2.x with TypeScript
- **Frontend**: React with Vite
- **Data Layer**: GraphQL via bfDb (SQLite/PostgreSQL)
- **GraphQL Client**: Isograph framework
- **Task Runner**: `bft` command
- **Source Control**: Sapling SCM

## Development Workflow

### Common Commands

```bash
bft help              # List all available commands
bft test             # Run tests
bft dev              # Start development servers
bft build            # Build applications
```

### Package Management

- System dependencies: Nix (`nix develop`)
- JS/TS packages: Deno (`deno add`)
- Local imports: `@bfmono/` prefix

## Key Architectural Patterns

### BfNode System

All entities in bfDb extend the BfNode base class, providing:

- Unified data model
- Automatic GraphQL schema generation
- Connection-based pagination
- Relationship traversal

### RLHF Workflow

Customer feedback loop for AI improvement:

1. Collect customer interactions
2. Generate evaluation specifications
3. Test AI responses
4. Deploy improvements

### Deck/Card System

Behavior specifications using `.deck.md` files stored in application
directories:

- Evaluation specifications for AI testing
- Composed into evaluation suites
- Executed via `bft` commands

## Import Resolution

The monorepo uses Deno's import map (configured in `deno.jsonc`):

- `@bfmono/*` - Internal monorepo modules
- `@std/*` - Deno standard library (from jsr.io)
- `npm:*` - NPM packages via Deno's npm compatibility

## Documentation Structure

- `/docs` - Reference guides and user documentation (frequently updated,
  non-actionable)
- `/memos` - Time-sensitive decisions and project plans (PARA method: Projects,
  Areas, Resources, Archive)
