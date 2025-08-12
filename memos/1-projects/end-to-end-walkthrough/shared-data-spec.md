# Shared Data Specification for E2E Test

## Overview

This document defines how data is shared between phases in the end-to-end test.

## Test Structure

```typescript
// Fixture loaded at module level
const SAMPLE_INVOICE_TEXT = await Deno.readTextFile(
  new URL("./fixtures/sample-invoice.txt", import.meta.url)
);

Deno.test("Complete E2E: Login → API Key → Samples → Grading", async (t) => {
  // Shared state variables - accessible by all test steps
  let extractedApiKey: string;
  let createdDeckId: string;
  let createdSampleId: string;
  
  await t.step("Phase 1: Login and extract API key", async () => {
    // ... login flow ...
    extractedApiKey = /* extracted from settings page */;
  });
  
  await t.step("Phase 2: Create samples via BfClient", async () => {
    // Uses: extractedApiKey, SAMPLE_INVOICE_TEXT
    // Sets: createdDeckId, createdSampleId
  });
  
  await t.step("Phase 3: Navigate and grade samples", async () => {
    // Uses: createdDeckId, createdSampleId, SAMPLE_INVOICE_TEXT
  });
});
```

## Shared Variables

### Between Phases

| Variable          | Type   | Set By  | Used By | Purpose                              | Availability |
| ----------------- | ------ | ------- | ------- | ------------------------------------ | ------------ |
| `extractedApiKey` | string | Phase 1 | Phase 2 | API key for BfClient authentication  | ✅ Reliable  |
| `createdDeckId`   | string | Phase 2 | Phase 3 | ID of deck to find in UI             | ✅ Reliable  |
| `createdSampleId` | string | Phase 2 | Phase 3 | ID of sample to verify in grading UI | ⚠️ Uncertain |

### Test Fixtures

| Fixture               | Location                        | Used By    | Purpose                                        |
| --------------------- | ------------------------------- | ---------- | ---------------------------------------------- |
| `SAMPLE_INVOICE_TEXT` | `./fixtures/sample-invoice.txt` | Phase 2, 3 | Sample data for creating and verifying samples |

## File Structure

```
/internalbf/bfmono/apps/boltfoundry-com/__tests__/e2e/
├── eval.test.e2e.ts
└── fixtures/
    └── sample-invoice.txt
```

## Implementation Notes

1. All shared variables are declared inside the main test function but outside
   individual steps
2. Each phase documents what variables it expects and what it provides
3. Fixtures are loaded once at module level for efficiency
4. Variable names should be consistent across all phase documentation
5. Variables marked as "Uncertain" may require alternative approaches:
   - `createdSampleId`: May require querying the GraphQL API after creation or
     tracking through telemetry response
6. Frontend components should display deck IDs as headlines to enable reliable
   test selection
