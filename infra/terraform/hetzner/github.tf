# GitHub Repository Configuration
terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.2"  # Rulesets require 6.2+
    }
  }
}

variable "github_token" {
  description = "GitHub Personal Access Token with repo permissions"
  type        = string
  sensitive   = true
}

variable "github_username" {
  description = "GitHub username/organization"
  type        = string
}

provider "github" {
  token = var.github_token
  owner = var.github_username
}

# Import existing repository
import {
  to = github_repository.bfmono
  id = "bfmono"
}

# Repository settings
resource "github_repository" "bfmono" {
  name = "bfmono"
  
  # Enable automerge for the repository
  allow_auto_merge = true
  
  # Also enable other useful features
  allow_squash_merge = false  # Disabled since we use rebase
  allow_merge_commit = false  # Disabled for linear history
  allow_rebase_merge = true   # Our preferred merge method
  delete_branch_on_merge = true  # Clean up merged branches
  
  # Don't create/delete the repo, just manage settings
  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      archived,
      description,
      has_downloads,
      has_issues,
      has_projects,
      has_wiki,
      homepage_url,
      private,
      topics,
      visibility
    ]
  }
}

# Environments
resource "github_repository_environment" "ci" {
  repository  = github_repository.bfmono.name
  environment = "ci"
}

resource "github_repository_environment" "production" {
  repository  = github_repository.bfmono.name
  environment = "production"
  
  # Optional: Add deployment protection rules
  # deployment_branch_policy {
  #   protected_branches     = true
  #   custom_branch_policies = false
  # }
}

resource "github_repository_environment" "infrastructure" {
  repository  = github_repository.bfmono.name
  environment = "infrastructure"
  
  # Stricter controls for infrastructure changes
  deployment_branch_policy {
    protected_branches     = true
    custom_branch_policies = false
  }
  
  # Add reviewers for infrastructure changes
  reviewers {
    users = []  # Add specific user IDs here if needed
    teams = []  # Add team IDs here if you have teams
  }
  
  # Prevent self-reviews for critical infrastructure
  prevent_self_review = true
  
  # Wait timer before deployment (in minutes)
  wait_timer = 5  # 5 minute delay for infrastructure changes
}

# Repository ruleset for main branch
resource "github_repository_ruleset" "main" {
  repository = github_repository.bfmono.name
  name       = "main-branch-protection"
  target     = "branch"
  enforcement = "active"

  conditions {
    ref_name {
      include = ["refs/heads/main"]
      exclude = []
    }
  }

  # Bypass for admins (optional - remove if you want admins to follow rules too)
  bypass_actors {
    actor_id    = 5  # Repository admins
    actor_type  = "RepositoryRole"
    bypass_mode = "pull_request"
  }

  rules {
    # Require pull requests
    pull_request {
      required_approving_review_count = 1  # Require at least 1 approval
      dismiss_stale_reviews_on_push   = false
      require_code_owner_review       = false
      require_last_push_approval      = false
    }

    # Required status checks
    required_status_checks {
      required_check {
        context = "setup"
      }
      required_check {
        context = "lint"
      }
      required_check {
        context = "format"
      }
      required_check {
        context = "typecheck"
      }
      required_check {
        context = "test"
      }
      required_check {
        context = "build"
      }
      required_check {
        context = "docker-build-validation"
      }
      required_check {
        context = "e2e"
      }
      strict_required_status_checks_policy = true  # Require branches to be up to date
    }

    # Block force pushes and deletions
    non_fast_forward = true  # Prevents force pushes
    deletion         = true  # Prevents branch deletion

    # Enforce linear history
    linear_history = true  # Prevents merge commits, requires rebasing

    # Require signed commits
    required_signatures = true  # All commits must be GPG or SSH signed

    # Enable merge queue
    required_merge_queue {
      merge_method                    = "REBASE"  # Maintains linear history
      build_concurrency               = 3
      min_entries_to_merge            = 1
      wait_timer                      = 0
      entry_timeout                   = 60
      merge_timeout                   = 15
      response_timeout                = 10
      check_response_timeout          = 10
    }
  }
}

# Note: OP_SERVICE_ACCOUNT_TOKEN is managed at the environment level
# Each environment (BFT: CI and BFT: Production) has its own token
# for accessing the appropriate 1Password vault

# Enable GitHub Actions
resource "github_actions_repository_permissions" "bfmono" {
  repository = github_repository.bfmono.name
  
  enabled         = true
  allowed_actions = "all"
}

# Configure Actions permissions
resource "github_repository_file" "actions_permissions" {
  repository = github_repository.bfmono.name
  file       = ".github/actions-permissions.yml"
  content    = yamlencode({
    permissions = {
      contents = "write"
      pull-requests = "write"
      issues = "write"
      actions = "write"
    }
  })
  
  lifecycle {
    ignore_changes = [content]  # Don't overwrite if manually edited
  }
}

# Outputs
output "repository_url" {
  value = "https://github.com/${var.github_username}/${github_repository.bfmono.name}"
}

output "environments" {
  value = ["ci", "production", "infrastructure"]
}