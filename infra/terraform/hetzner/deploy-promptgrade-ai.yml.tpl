service: promptgrade-ai

image: ghcr.io/${github_username}/promptgrade-ai

servers:
  web:
    - ${floating_ip}

# SSH configuration for Kamal 2.x
ssh:
  user: root
  keys:
    - ~/.ssh/id_rsa

# Builder configuration for Kamal 2.x
builder:
  arch:
    - amd64
  dockerfile: infra/Dockerfile.deploy
  context: .
  args:
    BINARY_PATH: build/promptgrade-ai
    BINARY_NAME: promptgrade-ai

# Kamal 2.x proxy configuration - HTTP only (SSL handled by Cloudflare)
proxy:
  ssl: false
  host: promptgrade.ai
  app_port: 8001
  healthcheck:
    path: /
    interval: 10
    timeout: 5

registry:
  # Use GitHub Container Registry for simplicity
  server: ghcr.io
  username: ${github_username}
  password:
    - GITHUB_TOKEN

env:
  clear:
    PORT: 8001
    BF_ENV: production
  secret:
    # This section will be dynamically populated by bft generate-kamal-config
    # based on secrets available in 1Password
    - PLACEHOLDER_SECRET

# HyperDX logging configuration
logging:
  driver: fluentd
  options:
    fluentd-address: tls://in-otel.hyperdx.io:24225
    labels: '__HDX_API_KEY,service.name'

# Docker labels for HyperDX
labels:
  __HDX_API_KEY: "${HYPERDX_API_KEY}"
  service.name: promptgrade-ai

aliases:
  console: app exec --interactive --reuse "bash"
  shell: app exec --interactive --reuse "bash"
  logs: app logs --follow

# OpenTelemetry Collector for observability
accessories:
  otel_collector:
    image: otel/opentelemetry-collector:0.100.0
    port: 4318
    files:
      - infra/terraform/hetzner/config/otel_collector.yml:/etc/otelcol/config.yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    options:
      user: 0
    roles:
      - web
    env:
      clear:
        HDX_API_KEY: "${HYPERDX_API_KEY}"

# Use floating IP directly, no load balancer needed