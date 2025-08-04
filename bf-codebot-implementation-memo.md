# BF-Codebot Implementation Memo: AI Attribution for Commits

## Goal

Properly attribute code written by AI assistants vs code written by humans by
having AI-generated commits show as coming from `bf-codebot` instead of
individual developer accounts.

## Approach

Extend the existing codebot infrastructure (`/workspace/infra/apps/codebot/`) to
use a dedicated GitHub account for AI-generated commits.

## Implementation Plan

### 1. Create bf-codebot GitHub Account

- Create GitHub account: `bf-codebot`
- Generate personal access token with repo permissions
- Store token in bft secrets as `CODEBOT_GITHUB_PAT`

### 2. Update Codebot Container Configuration

Modify `/workspace/infra/apps/codebot/Dockerfile` to:

- Retrieve bf-codebot token from `bft secrets`
- Configure git identity as `bf-codebot`
- Set up GitHub authentication using the bf-codebot token

**Changes needed in Dockerfile:**

Replace the existing GitHub authentication section:

```bash
# Configure GitHub authentication via GITHUB_TOKEN environment variable
if [ -n "\$GITHUB_TOKEN" ]; then
  # Configure git to use the token for GitHub
  git config --global credential.helper '!f() { echo "username=x-access-token"; echo "password=\$GITHUB_TOKEN"; }; f'
  git config --global url."https://x-access-token:\${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
fi
```

With:

```bash
# Get bf-codebot GitHub token from secrets
CODEBOT_PAT=\$(bft secrets get CODEBOT_GITHUB_PAT 2>/dev/null || echo "")

# Configure GitHub authentication for bf-codebot
if [ -n "\$CODEBOT_PAT" ]; then
  # Configure git identity as bf-codebot
  git config --global user.name "bf-codebot"
  git config --global user.email "bf-codebot@users.noreply.github.com"
  
  # Configure git to use the bf-codebot token for GitHub
  git config --global credential.helper '!f() { echo "username=bft-codebot"; echo "password=\$CODEBOT_PAT"; }; f'
  git config --global url."https://bft-codebot:\${CODEBOT_PAT}@github.com/".insteadOf "https://github.com/"
fi
```

### 3. Secret Management

Store the bf-codebot token securely:

```bash
bft secrets set CODEBOT_GITHUB_PAT <token_value>
```

### 4. Testing

1. Build updated codebot container
2. Run container and verify git configuration:
   ```bash
   git config --global user.name  # Should show: bf-codebot
   git config --global user.email # Should show: bf-codebot@users.noreply.github.com
   ```
3. Test commit attribution by making a test commit
4. Verify commit shows as authored by bf-codebot in GitHub

## Benefits

1. **Clear Attribution**: AI-generated commits clearly distinguished from human
   commits
2. **Simple Implementation**: Leverages existing codebot infrastructure
3. **Secure**: Uses bft secrets for token management
4. **Maintainable**: Minimal changes to existing system

## Migration Considerations

- Existing GITHUB_TOKEN environment variable approach can remain for backward
  compatibility
- bf-codebot account needs appropriate repository access permissions
- Consider repository-specific access controls for the bf-codebot account

## Next Steps

1. Create bf-codebot GitHub account
2. Generate and store personal access token in bft secrets
3. Update Dockerfile with new configuration
4. Test implementation
5. Deploy updated codebot container

## Commit Attribution Result

After implementation, AI-generated commits will show:

- **Author**: bf-codebot
- **Email**: bf-codebot@users.noreply.github.com
- **Clear distinction** from human developer commits in git history and GitHub
  UI
