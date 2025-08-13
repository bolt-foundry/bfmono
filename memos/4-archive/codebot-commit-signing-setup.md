# Codebot Commit Signing Setup

This guide explains how to set up SSH commit signing for bft-codebot to create
verified commits on GitHub.

## Prerequisites

- Access to `bft sitevar` for storing secrets
- GitHub account for bft-codebot with appropriate permissions

## Setup Steps

### 1. Generate SSH Signing Key

Generate a new SSH key specifically for commit signing:

```bash
ssh-keygen -t ed25519 -C "support@boltfoundry.com" -f ~/.ssh/bft-codebot-signing
```

### 2. Store the Private Key

Store the private key in site variables:

```bash
bft sitevar set CODEBOT_SSH_SIGNING_KEY "$(cat ~/.ssh/bft-codebot-signing)"
```

### 3. Add Public Key to GitHub

1. Copy the public key:
   ```bash
   cat ~/.ssh/bft-codebot-signing.pub
   ```

2. Go to GitHub account settings for bft-codebot
3. Navigate to "SSH and GPG keys"
4. Click "New SSH key"
5. Select "Signing Key" as the key type
6. Paste the public key and save

### 4. Test the Setup

After rebuilding the codebot container:

```bash
# Rebuild container with new configuration
bft codebot build

# Test in container
bft codebot --shell
git config --get commit.gpgsign  # Should output "true"
git config --get gpg.format       # Should output "ssh"
```

### 5. Verify Commits

When making commits in codebot, they will now be signed automatically. You can
verify this by:

1. Making a test commit
2. Running `git log --show-signature`
3. Checking GitHub - commits should show "Verified" badge

## Troubleshooting

- If commits aren't being signed, check that `CODEBOT_SSH_SIGNING_KEY` is
  properly set
- Ensure the public key is added to GitHub as a "Signing Key" (not just an
  authentication key)
- Check container logs for "✅ SSH commit signing configured" message

## Security Notes

- The SSH signing key is stored securely in site variables
- Only the codebot container has access to the signing key
- The key is automatically loaded when the container starts
