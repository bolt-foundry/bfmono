#!/bin/bash
# Local debug script for Terraform setup issues

set -euo pipefail

echo "=== Local Terraform Setup Debug ==="
echo ""

# Check if we're in the right directory
if [ ! -f "flake.nix" ]; then
    echo "❌ Error: Not in bfmono root directory"
    echo "Please run this from /internalbf/bfmono"
    exit 1
fi

echo "✅ Running from correct directory: $(pwd)"
echo ""

# Test nix develop
echo "=== Testing Nix Environment ==="
nix develop --accept-flake-config --command bash -c "
    echo '✅ Entered nix develop successfully'
    
    # Check bft command
    echo ''
    echo '=== Testing bft command ==='
    which bft || echo '❌ bft not found'
    bft --version || echo '❌ Cannot get bft version'
"

# Test 1Password connection
echo ""
echo "=== Testing 1Password Connection ==="
echo "Using OP_SERVICE_ACCOUNT_TOKEN from environment..."

if [ -z "${OP_SERVICE_ACCOUNT_TOKEN:-}" ]; then
    echo "❌ OP_SERVICE_ACCOUNT_TOKEN is not set"
    echo "Please set it with: export OP_SERVICE_ACCOUNT_TOKEN='your-token'"
    exit 1
fi

nix develop --accept-flake-config --command bash -c "
    export OP_SERVICE_ACCOUNT_TOKEN='$OP_SERVICE_ACCOUNT_TOKEN'
    
    # Test op CLI
    if command -v op &> /dev/null; then
        echo '✅ op CLI found'
        op vault list --format=json 2>&1 | jq -r '.[].name' || echo '❌ Failed to list vaults'
    else
        echo '❌ op CLI not found'
    fi
    
    echo ''
    echo '=== Testing bft sitevar ==='
    bft sitevar list || echo '❌ bft sitevar list failed'
    
    echo ''
    echo '=== Testing bft sitevar sync (dry run) ==='
    bft sitevar sync --dry-run || echo '❌ bft sitevar sync dry run failed'
    
    echo ''
    echo '=== Attempting actual sync ==='
    read -p 'Run actual sync? (y/N): ' -n 1 -r
    echo
    if [[ \$REPLY =~ ^[Yy]$ ]]; then
        bft sitevar sync --force
        
        echo ''
        echo '=== Checking results ==='
        if [ -f .env.secrets ]; then
            echo '✅ .env.secrets created'
            echo 'Required variables check:'
            for var in HETZNER_API_TOKEN TERRAFORM_BACKEND_ACCESS_KEY_ID TERRAFORM_BACKEND_SECRET_ACCESS_KEY TERRAFORM_BACKEND_ENDPOINT; do
                if grep -q \"^\${var}=\" .env.secrets; then
                    echo \"  ✅ \$var is present\"
                else
                    echo \"  ❌ \$var is MISSING\"
                fi
            done
        else
            echo '❌ .env.secrets not created'
        fi
    fi
"