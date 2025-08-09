# Terraform Infrastructure Configuration

## Project Structure

This Terraform configuration manages infrastructure across two Hetzner Cloud
projects:

### CI Project (bft_ci)

**Purpose**: Terraform state storage and CI/CD infrastructure

- Hosts the Terraform state bucket in Hetzner Object Storage
- Provides isolated environment for state management
- Prevents accidental state corruption from production issues

### Production Project (bft_production)

**Purpose**: Production application infrastructure

- All production resources (servers, volumes, floating IPs)
- Application asset storage (S3 bucket)
- Production databases and services

## 1Password Setup with bft sitevar

The infrastructure uses `bft sitevar` to manage secrets. Each
`OP_SERVICE_ACCOUNT_TOKEN` has access to only one vault.

### Required Sitevars in Production Vault

Create these items in your Production vault with the tag `BF_PRIVATE_SECRET`:

```bash
# Production resources
bft sitevar secret set HETZNER_API_TOKEN "<production-api-token>"
bft sitevar secret set HETZNER_PROJECT_ID "<production-project-id>"
bft sitevar secret set AWS_ACCESS_KEY_ID "<production-s3-access-key>"  # Hetzner S3 access key
bft sitevar secret set AWS_SECRET_ACCESS_KEY "<production-s3-secret-key>"  # Hetzner S3 secret key
bft sitevar secret set S3_ENDPOINT "https://hel1.your-objectstorage.com"  # Helsinki region

# CI resources for Terraform backend
bft sitevar secret set TERRAFORM_BACKEND_ENDPOINT "<ci-s3-endpoint>"
bft sitevar secret set TERRAFORM_BACKEND_ACCESS_KEY_ID "<ci-s3-access-key>"
bft sitevar secret set TERRAFORM_BACKEND_SECRET_ACCESS_KEY "<ci-s3-secret-key>"

# Other services
bft sitevar secret set CLOUDFLARE_API_TOKEN "<cloudflare-token>"
bft sitevar secret set CLOUDFLARE_ZONE_ID "<zone-id>"
bft sitevar secret set SSH_PUBLIC_KEY "<ssh-public-key-content>"
bft sitevar secret set SSH_PRIVATE_KEY "<ssh-private-key-content>"  # For Kamal deployment
bft sitevar secret set HYPERDX_API_KEY "<hyperdx-key>"
bft sitevar secret set GITHUB_PERSONAL_ACCESS_TOKEN "<github-pat>"  # See PAT requirements below
```

### GitHub Personal Access Token (PAT) Requirements

The `GITHUB_PERSONAL_ACCESS_TOKEN` needs the following scopes for Terraform to
manage repository settings:

**Required Fine-grained PAT Permissions:**

- **Repository permissions** for the `bfmono` repository:
  - Actions: Write (for secrets)
  - Administration: Write (for rulesets and settings)
  - Contents: Read
  - Environments: Write
  - Metadata: Read
  - Pull requests: Read
  - Secrets: Write

To create the token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Choose "Fine-grained personal access tokens"
3. Set expiration (recommend 90 days with calendar reminder to rotate)
4. Select the repository and permissions listed above
5. Generate and save the token to 1Password

### GitHub Repository Secret

Add only ONE secret to GitHub:

- `OP_SERVICE_ACCOUNT_TOKEN` - Service account with access to Production vault

## GitHub Environments

The infrastructure uses three GitHub environments with different security
levels:

### 1. ci

- **Purpose**: Regular CI/CD workflows
- **Protection**: Standard
- **Secret**: `OP_SERVICE_ACCOUNT_TOKEN` for CI vault access

### 2. production

- **Purpose**: Application deployments
- **Protection**: Standard production controls
- **Secret**: `OP_SERVICE_ACCOUNT_TOKEN` for Production vault access

### 3. infrastructure

- **Purpose**: Infrastructure changes (Terraform)
- **Protection**: Enhanced security
  - Cannot self-approve changes
  - 5-minute wait timer before deployment
  - Protected branches only
- **Secret**: `OP_SERVICE_ACCOUNT_TOKEN` for Production vault access
- **Used by**:
  - `infrastructure-hetzner.yml` - Terraform deployments
  - `terraform-operations.yml` - Manual Terraform operations

### Terraform Operations Workflow

For infrastructure management beyond standard deployments:

1. **Access**: Actions → Terraform Operations → Run workflow
2. **Available operations**:
   - `plan` - Preview changes
   - `state-list` - List resources in state
   - `state-show` - Show specific resource details
   - `refresh` - Update state from real infrastructure
   - `destroy` - Remove resources (requires confirmation)

**Note**: The GitHub repository is automatically imported via the `import` block
in `github.tf` during the first Terraform apply.

3. **Safety features**:
   - All operations require Environment Configuration approval
   - Destroy requires typing "destroy-production"
   - Full audit trail in GitHub Actions

## Codebot SSH Signing Setup

Since we require signed commits, you need to set up SSH signing for codebot:

1. **Generate SSH key for codebot** (if not already done):
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/codebot_signing_key -C "support@boltfoundry.com"
   ```

2. **Add the public key to GitHub**:
   - Go to the `bft-codebot` GitHub account settings
   - Settings → SSH and GPG keys → New SSH key
   - Select "Signing Key" as the key type
   - Paste the contents of `~/.ssh/codebot_signing_key.pub`

3. **Store the private key in 1Password**:
   ```bash
   bft sitevar secret set CODEBOT_SSH_SIGNING_KEY "$(cat ~/.ssh/codebot_signing_key)"
   ```

4. **Verify setup**:
   - Run `bft codebot` and make a test commit
   - Check that commits show as "Verified" on GitHub

## Deployment Order

**Important**: Infrastructure must be deployed before applications.

1. First deployment: Run "Deploy Infrastructure (Hetzner)" workflow
2. Subsequent deployments: Run "Deploy boltfoundry-com" workflow

The application deployment depends on the infrastructure existing (specifically
the floating IP).

## Setup Instructions

1. **Create Object Storage in CI Project**:
   - Log into Hetzner Cloud Console
   - Switch to CI project (bft_ci)
   - Create Object Storage bucket named `terraform-state` in Helsinki (hel1)
   - Generate S3 credentials
   - Add credentials to 1Password CI vault

2. **Create API Token in Production Project**:
   - Switch to Production project
   - Create API token with full permissions
   - Add to 1Password Production vault

3. **Run Terraform**:
   - Push changes to trigger GitHub Actions
   - Or manually run workflow
   - Terraform will use CI project for state, create resources in production

## Resource Locations

| Resource        | Project    | Location | Notes                            |
| --------------- | ---------- | -------- | -------------------------------- |
| Terraform State | CI         | Helsinki | Protected from production issues |
| Servers         | Production | US East  | All compute resources            |
| Floating IPs    | Production | US East  | Static IPs for services          |
| Volumes         | Production | US East  | Database storage                 |
| Asset Storage   | Production | Helsinki | Application files                |

## Security Benefits

This separation provides:

- **Isolated state management**: State corruption won't affect production access
- **Separate credentials**: CI and production use different API tokens
- **Audit trail**: Clear separation of infrastructure changes vs state access
- **Reduced blast radius**: Compromised production doesn't expose state

## Workflow Concurrency

All workflows that access Terraform state use a concurrency group to prevent
race conditions:

```yaml
concurrency:
  group: terraform-state
  cancel-in-progress: false
```

This ensures:

- Only one Terraform operation runs at a time
- No state corruption from concurrent modifications
- Clear error messages if workflows conflict
- Operations complete rather than being cancelled

The deploy workflow only reads state (via `terraform output`) rather than
modifying it, which minimizes lock contention while still ensuring consistency.
