# Phase 0: Build API Keys Page

## Overview

Create a settings page where users can view and copy their organization's API
keys. This is a prerequisite for the e2e test flow.

## Requirements

- Create new /settings route in the UI
- Display organization API keys in copyable input fields
- Connect to GraphQL to fetch organization's API keys

## Implementation Details

### Research Findings

- **No existing /settings route** in either BoltFoundry or BoltFoundry-Com apps
- **Design patterns available** from Contacts app
  (`/internalbf/bfmono/apps/contacts/client/src/components/EmailSettings.tsx`)
- **BfDs design system** provides all necessary components
- **No existing GraphQL API** for organization API keys - needs to be built

### Frontend Components Needed

1. **Settings Page Component**
   - Route: `/settings` (new route to be added)
   - Layout consistent with existing pages
   - Navigation from main app menu (update Nav.tsx)
   - Follow card-based layout pattern from EmailSettings

2. **API Keys Section**
   - Container element with class: `.api-keys-section`
   - Use `BfDsCard` with `BfDsCardContent` for structure
   - List of API keys for the organization
   - Each key displayed in read-only `BfDsInput` field with class:
     `input.api-key-field`
   - Each key element should have `data-api-key-id` attribute
   - Copy button using `BfDsButton` with icon
   - Use `BfDsToast` for copy confirmation feedback
   - Show key creation date and last used info if available
   - API key format: `bf+{organizationId}` (e.g., `bf+dev-org:example.com`)

3. **Empty State**
   - When no API keys exist, show message: "No API keys found"
   - Include button to create first API key (can be disabled for MVP)
   - This ensures Phase 1's error handling has something to work with

### GraphQL Integration

**Note: No existing GraphQL API for API keys - needs to be implemented in bfDb**

1. **Required GraphQL Schema Additions**
   ```graphql
   type BfApiKey {
     id: ID!
     key: String!
     organizationId: ID!
     createdAt: DateTime!
     lastUsedAt: DateTime
     description: String
   }

   extend type BfOrganization {
     apiKeys: [BfApiKey!]!
   }

   extend type Query {
     organizationApiKeys(organizationId: ID!): [BfApiKey!]!
   }
   ```

2. **Implementation Requirements**
   - Create new `BfApiKey` node type in bfDb
   - Add relationship to `BfOrganization`
   - Follow patterns from existing nodes like `BfDeck` and `BfSample`
   - Use BfNode base class for consistency

3. **Mutations (Future)**
   - Create new API key
   - Revoke existing API key
   - Update key permissions

### Security Considerations

- Only show keys to authorized organization members
- Consider masking keys partially (show last 4 characters)
- Add confirmation before revealing full key
- Log key access for audit trail

## Success Criteria

- [ ] Settings page accessible at /settings route
- [ ] Route added to routes.ts in boltfoundry-com app
- [ ] Navigation link added to Nav.tsx component
- [ ] API keys displayed in copyable format using BfDs components
- [ ] GraphQL schema and resolvers implemented in bfDb
- [ ] GraphQL query successfully fetches keys
- [ ] UI consistent with existing design system (follows EmailSettings pattern)
- [ ] Toast notifications for user feedback
- [ ] Basic security measures in place

## Next Steps

After this phase is complete, the e2e test can navigate to this page and extract
an API key for backend operations.
