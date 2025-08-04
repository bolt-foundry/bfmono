{
  description = "Bolt-Foundry unified dev environment";

  ########################
  ## 1. Inputs
  ########################
  inputs = {
    nixpkgs.url          = "github:NixOS/nixpkgs/26e168479fdc7a75fe55e457e713d8b5f794606a";
    flake-utils.url      = "github:numtide/flake-utils";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/27f23f25cd732fdb4f07328d55a0cea6ecdfb32e";
  };

  ########################
  ## 2. Outputs
  ########################
  outputs = { self, nixpkgs, flake-utils, nixpkgs-unstable, ... }:
    let
      ##################################################################
      # 2a.  Package sets - Now directly defined
      ##################################################################
      
      mkBaseDeps = { pkgs, system }:
        let
          unstable = import nixpkgs-unstable { inherit system; config.allowUnfree = true; };
        in
        [
          unstable.deno  # Use deno from unstable
          pkgs.git
        ];

      # everythingExtra = "stuff on top of base"
      mkEverythingExtra = { pkgs, system }:
        let
          lib = pkgs.lib;
          unstable = import nixpkgs-unstable { inherit system; config.allowUnfree = true; };
          # Include custom container tool package
          # To test a different version, set CONTAINER_VERSION environment variable:
          # CONTAINER_VERSION=0.3.1 nix develop --refresh
          # containerVersion = builtins.getEnv "CONTAINER_VERSION";
          # containerTool = if containerVersion != "" 
          #   then pkgs.callPackage ./infra/nix/container-tool-flexible.nix { version = containerVersion; }
          #   else pkgs.callPackage ./infra/nix/container-tool.nix {};
        in
        [
          pkgs.unzip
          pkgs.jupyter
          pkgs.jq
          pkgs.sapling
          pkgs.gh
          pkgs.python311Packages.tiktoken
          pkgs.nodejs_22
          pkgs._1password-cli
          pkgs.typescript-language-server
          pkgs.ffmpeg
          pkgs.nettools
          pkgs.ripgrep
          pkgs.fd
        ] ++ lib.optionals pkgs.stdenv.isDarwin [
          # Darwin-specific packages  
          # containerTool
          # unstable.container
        ] ++ lib.optionals (!pkgs.stdenv.isDarwin) [
          # Linux-only packages
          pkgs.chromium
          pkgs.iproute2
        ];

      ##################################################################
      # 2b.  Helpers
      ##################################################################
      # mkShellWith extras → dev-shell whose buildInputs = baseDeps ++ extras
      mkShellWith = { pkgs, system
        , extras ? [ ]
        , hookName ? "Shell"
        , env ? { }
        , shellHookExtra ? ""
        }:
      let
        baseDeps = mkBaseDeps { inherit pkgs system; };
      in
      pkgs.mkShell
      (env // {
        buildInputs = baseDeps ++ extras;
        shellHook = ''
          # nice banner
          echo -e "\e[1;34m[${hookName}]\e[0m  \
          base:${toString (map (p: p.name or "<pkg>") baseDeps)}  \
          extras:${toString (map (p: p.name or "<pkg>") extras)}"

          # Set up Bolt Foundry environment
          export BF_ROOT="$PWD"
          export PATH="$BF_ROOT/bin:$BF_ROOT/areas/bolt-foundry-monorepo/infra/bin:$PATH"
          export DENO_DIR="''${HOME}/.cache/deno"
          export GH_REPO="bolt-foundry/bolt-foundry"
          
          # Set INTERNALBF_ROOT to parent directory if we're in bfmono
          if [[ "$PWD" == */bfmono ]]; then
            export INTERNALBF_ROOT="$(dirname "$PWD")"
          else
            export INTERNALBF_ROOT="$PWD"
          fi

          # Function to load env file if it exists
          load_env_if_exists() {
            if [ -f "$1" ]; then
              echo "Loading $1..."
              set -a  # automatically export all variables
              source "$1"
              set +a
            fi
          }

          # Load environment files in order (later overrides earlier)
          load_env_if_exists .env.config.example  # Safe defaults
          load_env_if_exists .env.secrets.example # Safe defaults
          load_env_if_exists .env.config          # From 1Password
          load_env_if_exists .env.secrets         # From 1Password
          load_env_if_exists .env.local           # User overrides

          if [ ! -f ".env.config" ] && [ ! -f ".env.secrets" ]; then
            echo "No .env.config or .env.secrets found. Run 'bft sitevar sync' to load secrets from 1Password."
          fi

          ${shellHookExtra}
        '';
      });
    in

    ############################################################
    # 2c.  Per-system dev shells
    ############################################################
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };
        everythingExtra = mkEverythingExtra { inherit pkgs system; };
      in {
        devShells = rec {
          # canonical minimal environment
          base            = mkShellWith { inherit pkgs system; hookName = "Base shell"; };

          # codex = same as base
          codex           = mkShellWith { inherit pkgs system; hookName = "Codex shell"; };

          # full tool-chain variants
          everything      = mkShellWith { inherit pkgs system; extras = everythingExtra; hookName = "Everything shell"; };
          replit          = mkShellWith { inherit pkgs system; extras = everythingExtra; hookName = "Replit shell"; };
          github-actions  = mkShellWith { inherit pkgs system; extras = everythingExtra; hookName = "GitHub-Actions shell"; };

          # legacy alias
          default         = everything;
        };

        # FlakeHub-cached build packages
        packages = rec {
          # Build the main web application
          web = pkgs.stdenv.mkDerivation {
            pname = "bolt-foundry-web";
            version = "0.1.0";
            src = ./.;
            nativeBuildInputs = with pkgs; [ pkgs.deno ];
            buildPhase = ''
              export DENO_DIR=$TMPDIR/deno_cache
              deno task build:web
            '';
            installPhase = ''
              mkdir -p $out/bin
              cp build/web $out/bin/ || echo "No web binary found"
              cp -r static $out/ || echo "No static directory found"
            '';
          };

          # Build the marketing site
          boltfoundry-com = pkgs.stdenv.mkDerivation {
            pname = "boltfoundry-com";
            version = "0.1.0";
            src = ./.;
            nativeBuildInputs = with pkgs; [ pkgs.deno ];
            buildPhase = ''
              export DENO_DIR=$TMPDIR/deno_cache
              deno task build:boltfoundry-com
            '';
            installPhase = ''
              mkdir -p $out/bin
              cp build/boltfoundry-com $out/bin/ || echo "No boltfoundry-com binary found"
            '';
          };

          # Claude CLI script
          claude-cli = pkgs.writeShellScriptBin "claude" ''
            # Check for --upgrade or --update flags
            if [[ "$1" == "--upgrade" ]] || [[ "$1" == "--update" ]]; then
                echo "Upgrading Claude Code..."
                deno install --allow-scripts=npm:@anthropic-ai/claude-code npm:@anthropic-ai/claude-code
                echo "Claude Code has been upgraded successfully!"
                exit 0
            fi

            # Run Claude Code normally
            deno run -A npm:@anthropic-ai/claude-code "$@"
          '';

          # Profile script setup using runCommand to create proper structure
          codebot-profile = pkgs.runCommand "codebot-profile-setup" {} ''
            mkdir -p $out/etc/profile.d
            cat > $out/etc/profile.d/codebot-init.sh << 'EOF'
            # Claude Code environment initialization
            if [ "$CODEBOT_INITIALIZED" != "1" ]; then
              export CODEBOT_INITIALIZED=1
              
              # Set up Claude config files if they exist in workspace
              if [ -f "/workspace/claude.json" ]; then
                ln -sf /workspace/claude.json /root/.claude.json
              fi
              
              if [ -d "/workspace/claude" ]; then
                ln -sf /workspace/claude /root/.claude
              fi
              
              # Change to workspace directory
              if [ -d "/workspace" ]; then
                cd /workspace
              fi
            fi
            EOF
          '';

          # Container environment package (for nix profile install compatibility)
          codebot-env = pkgs.buildEnv {
            name = "codebot-environment";
            paths = (mkBaseDeps { inherit pkgs system; }) ++ everythingExtra ++ [ claude-cli ];
          };
        };
      }) //
    
    # NixOS configurations for proper container system setup
    {
      nixosConfigurations.codebot-container = nixpkgs.lib.nixosSystem {
        system = "aarch64-linux";
        modules = [
          ({ pkgs, ... }: {
            boot.isContainer = true;
            
            # Allow unfree packages
            nixpkgs.config.allowUnfree = true;
            
            # Import our package set as system packages
            environment.systemPackages = let
              pkgs = nixpkgs.legacyPackages.aarch64-linux;
            in (mkBaseDeps { inherit pkgs; system = "aarch64-linux"; }) ++ 
               (mkEverythingExtra { inherit pkgs; system = "aarch64-linux"; }) ++ 
               [ (pkgs.writeShellScriptBin "claude" ''
                   if [[ "$1" == "--upgrade" ]] || [[ "$1" == "--update" ]]; then
                       echo "Upgrading Claude Code..."
                       deno install --allow-scripts=npm:@anthropic-ai/claude-code npm:@anthropic-ai/claude-code
                       echo "Claude Code has been upgraded successfully!"
                       exit 0
                   fi
                   deno run -A npm:@anthropic-ai/claude-code "$@"
                 '') ];
            
            # Create /etc/profile.d script for Claude setup
            environment.etc."profile.d/codebot-init.sh" = {
              text = ''
                # Claude Code environment initialization
                if [ "$CODEBOT_INITIALIZED" != "1" ]; then
                  export CODEBOT_INITIALIZED=1
                  
                  # Set up Claude config files if they exist in workspace
                  if [ -f "/workspace/claude.json" ]; then
                    ln -sf /workspace/claude.json /root/.claude.json
                  fi
                  
                  if [ -d "/workspace/claude" ]; then
                    ln -sf /workspace/claude /root/.claude
                  fi
                  
                  # Change to workspace directory
                  if [ -d "/workspace" ]; then
                    cd /workspace
                  fi
                fi
              '';
              mode = "0644";
            };
            
            # Disable unnecessary services for containers
            services.udisks2.enable = false;
            security.polkit.enable = false;
            documentation.nixos.enable = false;
            programs.command-not-found.enable = false;
          })
        ];
      };
    };
}
