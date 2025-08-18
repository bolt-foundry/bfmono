# Kamal Deployment to Hetzner Infrastructure
terraform {
  required_version = ">= 1.9.0"
  
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
  
  # Backend uses CI project for state storage in Helsinki
  # The AWS credentials here are for the CI project's Object Storage
  backend "s3" {
    bucket                      = "bft-terraform-state"
    key                         = "boltfoundry-com/terraform.tfstate"
    region                      = "hel1"  # Helsinki region for state storage
    # endpoint configured via endpoint parameter in terraform init
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    force_path_style           = true
  }
}

variable "hcloud_token" {
  description = "Hetzner Cloud API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for boltfoundry.com"
  type        = string
}

variable "cloudflare_zone_id_promptgrade" {
  description = "Cloudflare Zone ID for promptgrade.ai"
  type        = string
}

variable "cloudflare_zone_id_bltcdn" {
  description = "Cloudflare Zone ID for bltcdn.com"
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "r2_access_key" {
  description = "R2 Access Key ID (can reuse AWS_ACCESS_KEY_ID)"
  type        = string
  sensitive   = true
}

variable "r2_secret_key" {
  description = "R2 Secret Access Key (can reuse AWS_SECRET_ACCESS_KEY)"
  type        = string
  sensitive   = true
}

variable "ssh_public_key" {
  description = "SSH public key for server access"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the deployment"
  type        = string
  default     = "boltfoundry.com"
}

variable "hyperdx_api_key" {
  description = "HyperDX API key for logging"
  type        = string
  sensitive   = true
}

variable "hetzner_project_id" {
  description = "Hetzner Cloud Project ID"
  type        = string
}

# Note: We still keep S3 credentials for Terraform state backend (Hetzner)
# Those are passed via AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env vars

provider "hcloud" {
  token = var.hcloud_token
  # This token should be from Production project
  # All Hetzner resources (servers, volumes, IPs) will be created in production
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Default AWS provider for Terraform S3 backend (Hetzner Object Storage)
# This is required even though backend config handles auth, due to provider requirements
provider "aws" {
  region = "us-east-1"  # Dummy region, not used by Hetzner S3
  
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_region_validation      = true
  skip_requesting_account_id  = true
}

# AWS provider for R2 (Cloudflare R2 Object Storage)
# This is for application assets, NOT Terraform state
provider "aws" {
  alias      = "r2"
  access_key = var.r2_access_key
  secret_key = var.r2_secret_key
  region     = "auto"
  
  endpoints {
    s3 = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
  }
  
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_region_validation      = true
  skip_requesting_account_id  = true
}

# SSH key for server access
resource "hcloud_ssh_key" "deploy" {
  name       = "kamal-deploy"
  public_key = var.ssh_public_key
}

# Floating IP (created first, unassigned)
resource "hcloud_floating_ip" "web" {
  type      = "ipv4"
  home_location = "ash"  # US East
}

# Server
resource "hcloud_server" "web" {
  name        = "boltfoundry-com"
  image       = "ubuntu-22.04"
  server_type = "cpx11"
  location    = "ash"  # US East (Ashburn, Virginia)
  ssh_keys    = [hcloud_ssh_key.deploy.id]
  
  user_data = templatefile("${path.module}/cloud-init.yml", {
    floating_ip = hcloud_floating_ip.web.ip_address
  })
}

# Assign floating IP to server
resource "hcloud_floating_ip_assignment" "web" {
  floating_ip_id = hcloud_floating_ip.web.id
  server_id      = hcloud_server.web.id
}

# Database volume (independent of server)
resource "hcloud_volume" "database" {
  name     = "boltfoundry-db"
  size     = 10  # 10GB for SQLite database
  location = "ash"  # US East (same as server)
}

resource "hcloud_volume_attachment" "database" {
  volume_id = hcloud_volume.database.id
  server_id = hcloud_server.web.id
}

# Daily server snapshots for backup  
resource "hcloud_snapshot" "server_backup" {
  # Note: This creates a one-time server snapshot
  # For automated daily snapshots, use Hetzner's snapshot automation
  # or implement via GitHub Actions cron job
  server_id   = hcloud_server.web.id
  description = "Server backup snapshot"
  labels = {
    purpose = "backup"
    app     = "boltfoundry-com"
  }
}

# Cloudflare DNS record with proxy enabled for SSL and DDoS protection
resource "cloudflare_record" "web" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain_name == "boltfoundry.com" ? "@" : replace(var.domain_name, ".boltfoundry.com", "")
  value   = hcloud_floating_ip.web.ip_address
  type    = "A"
  ttl     = 1  # Auto TTL
  proxied = true  # Enable Cloudflare proxy for SSL termination and protection
}

# Cloudflare DNS record for promptgrade.ai
resource "cloudflare_record" "promptgrade" {
  zone_id = var.cloudflare_zone_id_promptgrade
  name    = "@"
  value   = hcloud_floating_ip.web.ip_address
  type    = "A"
  ttl     = 1  # Auto TTL
  proxied = true  # Enable Cloudflare proxy for SSL termination and protection
}

# Cloudflare R2 bucket for asset storage
resource "cloudflare_r2_bucket" "assets" {
  account_id = var.cloudflare_account_id
  name       = "bft-assets"  # Simple name, no random suffix needed
  location   = "ENAM"  # Eastern North America
}

# R2 Custom Domain configuration
# Note: The cloudflare_r2_custom_domain resource may not be available in all provider versions
# As a workaround, you can:
# 1. Set up the custom domain manually in Cloudflare Dashboard -> R2 -> Your bucket -> Settings -> Custom Domains
# 2. Or use a CNAME record pointing to the R2 public URL (once public access is enabled)

# For now, create a CNAME to the R2 public bucket URL
# The bucket needs to have public access enabled in the dashboard
resource "cloudflare_record" "bltcdn" {
  zone_id = var.cloudflare_zone_id_bltcdn
  name    = "@"
  # R2 public URL format: <bucket-name>.<account-id>.r2.dev
  value   = "${cloudflare_r2_bucket.assets.name}.${var.cloudflare_account_id}.r2.dev"
  type    = "CNAME"
  ttl     = 1
  proxied = true  # Use Cloudflare CDN
}

# IMPORTANT: Manual step required after Terraform apply:
# 1. Go to Cloudflare Dashboard -> R2 -> bft-assets bucket
# 2. Go to Settings tab
# 3. Under "Public Access", click "Allow Access"
# 4. Add custom domain: bltcdn.com
#
# Benefits of R2:
# - Zero egress fees
# - Automatic CDN integration
# - No Host header issues (unlike S3)
# - SSL/TLS included

# Kamal config is now generated dynamically by bft generate-kamal-config
# This avoids the need to commit generated files and prevents circular dependencies

# Outputs
output "server_ip" {
  value = hcloud_floating_ip.web.ip_address
}

output "server_name" {
  value = hcloud_server.web.name
}

output "domain" {
  value = var.domain_name
}

output "volume_id" {
  value = hcloud_volume.database.id
}

output "r2_bucket_name" {
  value = cloudflare_r2_bucket.assets.name
  description = "R2 bucket name for asset storage"
}

output "r2_bucket_endpoint" {
  value = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com/${cloudflare_r2_bucket.assets.name}"
  description = "R2 bucket S3 API endpoint"
}

output "bltcdn_domain" {
  value = "bltcdn.com"
  description = "CDN domain for assets (automatically configured with R2)"
}