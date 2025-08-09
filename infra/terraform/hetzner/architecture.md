# Infrastructure Architecture

## Overview

This diagram shows the complete infrastructure setup across two Hetzner
projects, GitHub environments, and 1Password vaults.

```mermaid
graph TB
    subgraph "GitHub"
        GH_REPO[GitHub Repository<br/>bfmono]
        GH_ENV_CI["Environment: ci<br/>Secret: OP_SERVICE_ACCOUNT_TOKEN"]
        GH_ENV_PROD["Environment: production<br/>Secret: OP_SERVICE_ACCOUNT_TOKEN"]
        
        GH_REPO --> GH_ENV_CI
        GH_REPO --> GH_ENV_PROD
    end
    
    subgraph "1Password"
        OP_CI[CI Vault<br/>Service Account Token]
        OP_PROD[Production Vault<br/>Service Account Token]
    end
    
    subgraph "Hetzner Cloud"
        subgraph "bft_ci Project"
            CI_S3[Object Storage<br/>Terraform State<br/>Bucket: bft-terraform-state<br/>Location: Helsinki]
        end
        
        subgraph "bft_production Project"
            PROD_SERVER[Server<br/>boltfoundry-com<br/>Ubuntu 22.04<br/>Location: US East]
            PROD_IP[Floating IP<br/>Public Access<br/>Location: US East]
            PROD_VOL[Volume<br/>10GB SQLite DB<br/>Location: US East]
            PROD_S3[Object Storage<br/>Application Assets<br/>Bucket: bft-assets<br/>Location: Helsinki]
            
            PROD_SERVER --> PROD_VOL
            PROD_IP --> PROD_SERVER
        end
    end
    
    subgraph "External Services"
        CF[Cloudflare<br/>DNS & CDN]
        HYPERDX[HyperDX<br/>Monitoring]
    end
    
    %% Connections
    GH_ENV_CI -.->|Accesses| OP_CI
    GH_ENV_PROD -.->|Accesses| OP_PROD
    
    OP_CI -->|Backend Credentials| CI_S3
    OP_PROD -->|Infrastructure Tokens| PROD_SERVER
    OP_PROD -->|API Tokens| CF
    OP_PROD -->|API Keys| HYPERDX
    
    CF -->|DNS A Record| PROD_IP
    CF -->|CDN CNAME| PROD_S3
    
    classDef github fill:#f9f,stroke:#333,stroke-width:2px
    classDef onepass fill:#0088ff,stroke:#333,stroke-width:2px,color:#fff
    classDef hetzner fill:#d50c2d,stroke:#333,stroke-width:2px,color:#fff
    classDef external fill:#90EE90,stroke:#333,stroke-width:2px
    
    class GH_REPO,GH_ENV_CI,GH_ENV_PROD github
    class OP_CI,OP_PROD onepass
    class CI_S3,PROD_SERVER,PROD_IP,PROD_VOL,PROD_S3 hetzner
    class CF,HYPERDX external
```

## Data Flow

### 1. Terraform State Management

```mermaid
sequenceDiagram
    participant GHA as GitHub Actions
    participant OP as 1Password
    participant TF as Terraform
    participant CI_S3 as CI Object Storage
    participant PROD as Production Resources
    
    GHA->>OP: Fetch credentials via OP_SERVICE_ACCOUNT_TOKEN
    OP-->>GHA: Return CI & Production secrets
    GHA->>TF: terraform init with CI S3 backend
    TF->>CI_S3: Read/Write state file
    GHA->>TF: terraform apply
    TF->>PROD: Create/Update resources
    TF->>CI_S3: Update state file
```

### 2. Application Deployment

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant REG as GitHub Container Registry
    participant PROD as Production Server
    
    Dev->>GH: Push to main branch
    GH->>GHA: Trigger deployment workflow
    GHA->>GHA: Build binary with bft
    GHA->>REG: Push Docker image
    GHA->>PROD: Deploy via Kamal
    PROD->>PROD: Pull image and restart
```

## Security Architecture

### Secret Management Flow

```mermaid
graph LR
    subgraph "GitHub Secrets"
        GH_SECRET[OP_SERVICE_ACCOUNT_TOKEN<br/>Only secret in GitHub]
    end
    
    subgraph "1Password Vaults"
        direction TB
        CI_VAULT[CI Vault<br/>- Terraform Backend Creds<br/>- CI-specific secrets]
        PROD_VAULT[Production Vault<br/>- Hetzner API Token<br/>- Cloudflare Creds<br/>- App Secrets]
    end
    
    subgraph "Runtime"
        WORKFLOW[GitHub Workflow<br/>bft sitevar sync]
        ENV_SECRETS[.env.secrets<br/>Local file]
    end
    
    GH_SECRET -->|Environment-specific token| CI_VAULT
    GH_SECRET -->|Environment-specific token| PROD_VAULT
    CI_VAULT -->|bft sitevar| WORKFLOW
    PROD_VAULT -->|bft sitevar| WORKFLOW
    WORKFLOW -->|Writes| ENV_SECRETS
    
    style GH_SECRET fill:#ff6b6b,stroke:#333,stroke-width:2px
    style ENV_SECRETS fill:#ffd93d,stroke:#333,stroke-width:2px
```

## Resource Separation

| Component               | CI Project | Production Project | Location | Purpose                           |
| ----------------------- | ---------- | ------------------ | -------- | --------------------------------- |
| Terraform State         | ✅         | ❌                 | Helsinki | Isolated from production failures |
| Application Servers     | ❌         | ✅                 | US East  | Production workloads              |
| Object Storage (State)  | ✅         | ❌                 | Helsinki | Terraform state backend           |
| Object Storage (Assets) | ❌         | ✅                 | Helsinki | Application files and media       |
| Floating IPs            | ❌         | ✅                 | US East  | Public access points              |
| Volumes                 | ❌         | ✅                 | US East  | Database storage                  |

## How Secrets Flow to Production

### Overview

Production secrets follow a secure path from 1Password to running containers
without being exposed in logs, images, or repositories.

### Secret Flow Process

```mermaid
sequenceDiagram
    participant 1P as 1Password<br/>Production Vault
    participant GH as GitHub Actions<br/>production
    participant BFT as bft sitevar
    participant ENV as .env file
    participant K as Kamal
    participant D as Docker Container

    GH->>1P: Authenticate with OP_SERVICE_ACCOUNT_TOKEN
    GH->>BFT: Run "bft sitevar sync --secret-only"
    BFT->>1P: Fetch secrets tagged BF_PRIVATE_SECRET
    BFT->>ENV: Write secrets to .env.secrets
    GH->>ENV: Copy .env.secrets to .env
    GH->>K: Run "kamal deploy"
    K->>ENV: Read secrets from .env
    K->>D: Pass secrets as environment variables
    D->>D: Access secrets via process.env
```

### Implementation Details

1. **1Password Setup** (One-time):
   ```bash
   # Store secrets in Production vault with BF_PRIVATE_SECRET tag
   bft sitevar secret set DATABASE_URL "postgres://..."
   bft sitevar secret set OPEN_AI_API_KEY "sk-..."
   # etc.
   ```

2. **Kamal Configuration** (`deploy.yml.tpl`):
   ```yaml
   env:
     clear:
       # Non-sensitive config
       PORT: 8000
       BF_ENV: production
     secret:
       # Sensitive values read from .env file
       - DATABASE_URL
       - OPEN_AI_API_KEY
       - ASSEMBLY_AI_KEY
       # etc.
   ```

3. **Deployment Workflow**:
   - GitHub Actions authenticates to 1Password using environment-specific token
   - `bft sitevar sync` pulls all secrets to `.env.secrets`
   - Secrets are passed to Kamal via `.env` file
   - Kamal injects them as environment variables in containers

### Security Guarantees

- ✅ **No secrets in Git**: Only `OP_SERVICE_ACCOUNT_TOKEN` in GitHub
- ✅ **No secrets in images**: Docker images contain no secrets
- ✅ **No secrets in logs**: Kamal masks sensitive values
- ✅ **Encrypted at rest**: 1Password handles encryption
- ✅ **Audit trail**: 1Password logs all access
- ✅ **Easy rotation**: Update in 1Password and redeploy

### Adding New Secrets

1. Add to 1Password:
   ```bash
   bft sitevar secret set NEW_SECRET "value"
   ```

2. That's it! The deployment process will:
   - Run `bft sitevar sync` to pull all secrets
   - Run `bft generate-kamal-config` to dynamically update the Kamal config
   - Include your new secret automatically

The secret will automatically flow to production on the next deployment.

### How Dynamic Secret Generation Works

The `bft generate-kamal-config` task:

1. Reads all available secrets from `.env.secrets`
2. Filters out infrastructure-only secrets (like API tokens)
3. Automatically includes all runtime secrets in the Kamal config
4. No manual config updates needed when adding/removing secrets

## Benefits of This Architecture

1. **State Isolation**: Terraform state is physically separated from production
   resources
2. **Credential Separation**: Different service accounts for CI vs Production
3. **Single Secret**: Only `OP_SERVICE_ACCOUNT_TOKEN` needs to be in GitHub
4. **Audit Trail**: Clear separation of who accesses what
5. **Disaster Recovery**: Production issues can't corrupt Terraform state
6. **Cost Allocation**: Clear project boundaries for billing
