# promptgrade.ai Implementation

## Overview

promptgrade.ai is a marketing/landing page website that will be deployed as a
separate application within the bfmono monorepo. This memo outlines the
implementation approach to create a minimal viable version that can be deployed
to production.

## Goals

1. Create a simple marketing site that displays "Welcome to promptgrade.ai"
2. Mirror the boltfoundry-com application structure for consistency
3. Integrate with existing bft tooling (compile, dev, etc.)
4. Deploy to the same infrastructure with proper DNS configuration

## Implementation Plan

The implementation is divided into three phases:

### [Phase 1: Create Minimal Application](./phase-1-minimal-application.md)

Create a minimal promptgrade.ai application that displays "Welcome to
promptgrade.ai" and integrates with the existing build system.

### [Phase 2: Infrastructure Integration](./phase-2-infrastructure-integration.md)

Ensure the application integrates properly with the build system and deployment
infrastructure.

### [Phase 3: Future Enhancements](./phase-3-future-enhancements.md)

Once the basic site is deployed and working, enhance it with proper marketing
content and features.

## Technical Decisions

1. **Use BfDs** - Maintain design consistency across all Bolt Foundry properties
2. **Server-Side Rendering** - Same SSR approach as boltfoundry-com for SEO and
   performance
3. **Same Port Pattern** - Use 8001 to avoid conflicts (boltfoundry-com
   uses 8000)

## Open Questions

1. What content will eventually go on the marketing page?
2. Will this need a CMS or will content be hardcoded?
3. Any specific analytics or tracking requirements?

## Next Steps

1. Create the application files following boltfoundry-com patterns
2. Test locally with `bft dev promptgrade-ai`
3. Build and verify with `bft compile promptgrade-ai`
4. Deploy to production using existing CI/CD pipeline
