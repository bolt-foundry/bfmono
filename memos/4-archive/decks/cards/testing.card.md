When writing tests, follow these patterns and principles:

## Test-Driven Development (TDD)

Always follow the TDD workflow:

1. Project plan leads to implementation plan
2. Implementation plan leads to tests before code
3. Write tests first, then scaffold functions without implementations
4. Ensure tests fail in the expected way before implementing
5. Write minimal code to make tests pass

## Test Organization

- Place test files in `__tests__/` folders next to the files they test
- Test file naming: `file.ts` → `__tests__/file.test.ts`
- Make test files executable: `chmod +x __tests__/file.test.ts`
- Test names should describe behavior, not function names
- Avoid scenario-based test files with arbitrary scope

## Test Philosophy

- Write the minimum number of tests needed to prove functionality
- Focus on testing key APIs and behaviors
- Target p90 coverage, not p99 - we care about common cases
- Each test should test one specific behavior

## Test Runner and Assertions

- Use Deno's built-in test runner: `Deno.test()`
- Import assertions from `@std/assert`
- Common assertions: `assertEquals`, `assertExists`, `assert`, `assertThrows`,
  `assertRejects`
- Use `t.step()` to break complex tests into smaller parts

## Database Testing

- Always use `withIsolatedDb()` for database tests
- Use shared fixtures for overlapping functionality (e.g., `makeLoggedInCv()`)
- Database tests belong in the module where the functionality lives

```typescript
Deno.test("database operation", async () => {
  await withIsolatedDb(async () => {
    const cv = makeLoggedInCv();
    // Test database operations
  });
});
```

## Test Data and Fixtures

- Use shared fixtures for codebases with large overlaps (e.g., BfDb)
- Use inline test data for simple, isolated tests
- No specific conventions yet for relational test data

## Mocking and Stubbing

- Prefer stubs over full mocks
- Use full mocks only when implementation details affect code behavior
- Always mock external API calls - never hit real APIs in tests
- Use `@std/testing/mock` for stubbing

```typescript
import { stub } from "@std/testing/mock";

const fetchStub = stub(
  globalThis,
  "fetch",
  () => Promise.resolve(new Response("mocked")),
);
```

## Async Testing

- Always use `async/await` instead of `.then()` chains
- Use `assertRejects` when testing that async functions throw
- Prefer fake timers for time-based tests
- Ensure all async operations complete before test ends

```typescript
Deno.test("async operation", async () => {
  const result = await someAsyncFunction();
  assertEquals(result, expected);
});
```

## Error Testing

- Use `BfError` and extend it for specific error types
- Test error classes, not error messages
- For validation errors, test only representative cases
- Focus on intentional errors we throw, not edge cases

```typescript
import { assertThrows } from "@std/assert";
import { BfError } from "lib/BfError.ts";

Deno.test("throws BfError", () => {
  assertThrows(
    () => someFunction(),
    BfError,
  );
});
```

## UI Component Testing

- Use the custom `render()` utility from `infra/testing/ui-testing.ts`
- Test component behavior and user interactions
- Keep UI tests focused on functionality, not implementation

```typescript
import { render } from "infra/testing/ui-testing.ts";

Deno.test("Component behavior", () => {
  const { getByText } = render(<MyComponent />);
  const element = getByText("Expected Text");
  assertExists(element);
});
```

## Running Tests

- Run all tests: `bff test`
- Run specific test: `bff test path/to/file.test.ts`
- Make tests executable: `#! /usr/bin/env -S bff test`
- Use `--filter` for running specific tests
- Prefer `Deno.test.ignore` over `ignore: true` for tests to skip

## E2E Testing

- E2E test files use `.test.e2e.ts` extension
- Use setup/teardown utilities from `infra/testing/e2e/setup.ts`
- Always cleanup in `finally` blocks

```typescript
Deno.test("E2E test", async () => {
  const context = await setupE2ETest(); // Headless mode determined automatically
  try {
    await navigateTo(context, "/path");
    // Test interactions
  } finally {
    await teardownE2ETest(context);
  }
});
```

## Best Practices

- Write descriptive test names that explain the expected behavior
- Follow arrange-act-assert pattern
- Keep tests independent - no shared state between tests
- Test both success and failure cases
- Use type safety - avoid `any` in tests
- Close resources and clean up after tests
