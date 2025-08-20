# Hierarchical Naming Pattern

## Core Principle: Evolution-First Naming

Just as Pokémon are named by their evolutionary stage first (Charmander →
Charmeleon → Charizard), our code follows a hierarchical-first naming pattern.
The most general category comes first, followed by increasingly specific
descriptors.

## Pattern

```
[Category][Specific][Purpose]
```

When natural naming feels awkward, use "For" as a connector:

```
[Category]For[Purpose]
```

## Examples

✅ **Correct** (Hierarchical-First):

- `PokemonFireStarter` (not `StarterFirePokemon`)
- `ItemPotionSuper` (not `SuperPotionItem`)
- `TrainerGymLeader` (not `GymLeaderTrainer`)
- `MovePhysicalTackle` (not `TacklePhysicalMove`)

✅ **Correct** (Using "For" when needed):

- `AdapterForPostgres` (an adapter specifically built for Postgres)
- `HelperForTesting` (a helper utility specifically for tests)
- `ConfigForProduction` (configuration specifically for production env)

❌ **Incorrect** (Purpose-First):

- `StarterPokemonFire`
- `PotionItem`
- `LeaderTrainer`
- `TackleMovePhysical`
- `PostgresAdapter`
- `TestingHelper`
- `ProductionConfig`

## Rationale

Like organizing a Pokédex by type → species → variant, this pattern:

- Groups related concepts together in file explorers and autocomplete
- Makes the codebase hierarchy immediately visible
- Follows the natural mental model of category → subcategory → instance

## Real Code Examples

```typescript
// Components
ComponentButtonPrimary; // not PrimaryButton
ComponentFormInput; // not InputFormComponent
ComponentModalConfirm; // not ConfirmModal
ComponentNavigationBar; // not NavigationBarComponent

// Services (when extending from base classes)
AuthServiceGoogle; // extends AuthService (not GoogleAuthService)
DatabaseServicePostgres; // extends DatabaseService (not PostgresDatabaseService)
PaymentServiceStripe; // extends PaymentService (not StripePaymentService)

// Services (when standalone)
ServiceEmailSender; // not EmailSenderService
ServiceCacheRedis; // not RedisCacheService

// Types
TypeUserAdmin; // not AdminUserType
TypeResponseError; // not ErrorResponseType
TypeValidationEmail; // not EmailValidationType

// Using "For" pattern
MiddlewareForAuth; // middleware specifically for authentication
UtilityForTesting; // utility specifically for test scenarios
BuilderForGraphQL; // builder specifically for GraphQL schemas
```

Remember: Just as you'd say "Pokémon Fire-type Charizard" not "Charizard Fire
Pokémon", always lead with the broadest category!
