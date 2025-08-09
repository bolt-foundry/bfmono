#!/bin/bash
# Script to destroy Terraform infrastructure
# This is a temporary solution until the workflow is available

set -euo pipefail

echo "🚨 WARNING: This will destroy all Terraform-managed infrastructure!"
echo ""
echo "This includes:"
echo "  - Hetzner Cloud servers"
echo "  - Floating IPs"
echo "  - Volumes"
echo "  - DNS records"
echo "  - S3 buckets"
echo ""
read -p "Type 'destroy-production' to confirm: " confirmation

if [ "$confirmation" != "destroy-production" ]; then
    echo "❌ Destruction cancelled"
    exit 1
fi

echo ""
echo "📦 Loading environment..."

# Source environment files if they exist
if [ -f "../../../.env.config" ]; then
    source ../../../.env.config
    echo "✅ Loaded .env.config"
fi

if [ -f "../../../.env.secrets" ]; then
    source ../../../.env.secrets
    echo "✅ Loaded .env.secrets"
fi

# Export Terraform variables
export TF_VAR_hcloud_token="$HETZNER_API_TOKEN"
export TF_VAR_cloudflare_api_token="$CLOUDFLARE_API_TOKEN"
export TF_VAR_cloudflare_zone_id="$CLOUDFLARE_ZONE_ID"
export TF_VAR_ssh_public_key="$SSH_PUBLIC_KEY"
export TF_VAR_hyperdx_api_key="$HYPERDX_API_KEY"
export TF_VAR_s3_access_key="$AWS_ACCESS_KEY_ID"
export TF_VAR_s3_secret_key="$AWS_SECRET_ACCESS_KEY"
export TF_VAR_github_token="$GITHUB_PERSONAL_ACCESS_TOKEN"
export TF_VAR_hetzner_project_id="$HETZNER_PROJECT_ID"
export TF_VAR_s3_endpoint="$S3_ENDPOINT"

# Use CI credentials for backend
export AWS_ACCESS_KEY_ID="$TERRAFORM_BACKEND_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$TERRAFORM_BACKEND_SECRET_ACCESS_KEY"

echo ""
echo "🔧 Initializing Terraform..."
terraform init -backend-config="endpoint=$TERRAFORM_BACKEND_ENDPOINT"

echo ""
echo "📋 Current state:"
terraform state list || echo "No resources in state or state not accessible"

echo ""
echo "💥 Destroying infrastructure..."
terraform destroy -auto-approve

echo ""
echo "✅ Infrastructure destroyed successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'Deploy Infrastructure (Hetzner)' workflow to create fresh infrastructure"
echo "2. Run 'Deploy boltfoundry-com' workflow to deploy the application"