#!/usr/bin/env bash
# Script to import existing resources into Terraform state

set -euo pipefail

echo "Importing existing Cloudflare DNS record for bltcdn..."

# Import the existing bltcdn record
# Format: terraform import cloudflare_record.bltcdn <zone_id>/<record_id>
# We need to find the record ID first

# Get the zone ID from environment
ZONE_ID="${CLOUDFLARE_ZONE_ID:-$TF_VAR_cloudflare_zone_id}"

if [ -z "$ZONE_ID" ]; then
  echo "Error: CLOUDFLARE_ZONE_ID or TF_VAR_cloudflare_zone_id must be set"
  exit 1
fi

echo "Using Cloudflare Zone ID: $ZONE_ID"

# Find the record ID using Cloudflare API
RECORD_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=bltcdn.boltfoundry.com" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.result[0].id')

if [ "$RECORD_ID" = "null" ] || [ -z "$RECORD_ID" ]; then
  echo "Warning: bltcdn record not found, skipping import"
else
  echo "Found record ID: $RECORD_ID"
  echo "Running: terraform import cloudflare_record.bltcdn $ZONE_ID/$RECORD_ID"
  terraform import cloudflare_record.bltcdn "$ZONE_ID/$RECORD_ID" || echo "Import failed, record may not exist or already be imported"
fi

echo "Import process completed"