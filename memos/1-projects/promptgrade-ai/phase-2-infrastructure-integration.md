# Phase 2: Infrastructure Integration

## Objective

Ensure the promptgrade.ai application integrates properly with the build system
and deployment infrastructure.

## Tasks

### 1. Build System Integration

#### Verify bft Commands

- [ ] `bft compile promptgrade-ai` produces a working binary
- [ ] `bft dev promptgrade-ai` starts development server
- [ ] Build output is in expected location for deployment

#### Expected bft Integration

- The compile command should automatically work if app follows conventions
- No new task files needed - relies on existing patterns
- Binary output should go to `build/promptgrade-ai`

### 2. Deployment Configuration Verification

#### GitHub Workflow

**File**: `.github/workflows/deploy-promptgrade-ai.yml`

- Already exists in PR
- Triggers on pushes to `apps/promptgrade-ai/**`
- Builds Docker image with compiled binary
- Deploys using Kamal

#### Kamal Template

**File**: `infra/terraform/hetzner/deploy-promptgrade-ai.yml.tpl`

- Already exists in PR
- Configured for port 8001
- Uses same infrastructure patterns as boltfoundry-com

#### Terraform Configuration

**File**: `infra/terraform/hetzner/main.tf`

- DNS record for promptgrade.ai already configured
- Points to same floating IP as other services
- Cloudflare proxy enabled for SSL

### 3. Environment Variables

#### Required for Production Runtime:

- `PORT=8001` - Application server port
- `BF_ENV=production` - Environment identifier

#### Required for Deployment (GitHub Secrets):

- `CLOUDFLARE_ZONE_ID_PROMPTGRADE` - Cloudflare zone ID for promptgrade.ai
  domain
- `CLOUDFLARE_API_TOKEN` - For DNS management
- `HETZNER_API_TOKEN` - Infrastructure provider access
- `GITHUB_TOKEN` - For container registry access
- `OP_SERVICE_ACCOUNT_TOKEN` - 1Password integration
- `SSH_PRIVATE_KEY` - For server access
- `HYPERDX_API_KEY` - For logging/monitoring

#### Optional (from 1Password):

- Additional application-specific secrets can be synced via `bft sitevar sync`

### 4. Missing Infrastructure Components

#### Need to Verify

- [ ] Verify `infra/Dockerfile.deploy` works with promptgrade-ai binary
- [ ] Verify CLOUDFLARE_ZONE_ID_PROMPTGRADE is set in GitHub secrets

#### Potential Issues to Address

- Missing app directory will cause build failure
- Database configuration (if needed later)

### 5. Testing Deployment

1. **Local Build Test**
   ```bash
   bft compile promptgrade-ai
   ./build/promptgrade-ai  # Test the binary runs
   ```

2. **Docker Build Test**
   ```bash
   docker build -f infra/Dockerfile.deploy \
     --build-arg BINARY_PATH=build/promptgrade-ai \
     --build-arg BINARY_NAME=promptgrade-ai .
   ```

3. **Health Check Verification**
   - Ensure `/` endpoint returns 200 OK
   - Verify "Welcome to promptgrade.ai" is in response

### 6. Success Criteria

- [ ] Application builds successfully in CI
- [ ] Docker image is created and pushed to registry
- [ ] Deployment succeeds without manual intervention
- [ ] Site is accessible at https://promptgrade.ai
- [ ] SSL certificate works (via Cloudflare)
- [ ] Health checks pass
