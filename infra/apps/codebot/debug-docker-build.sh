#!/bin/bash
# Debug script for Docker build issues

set -e

echo "=== Docker Build Debug Script ==="
echo "This script helps debug Docker build issues for the codebot container"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed or not in PATH${NC}"
    exit 1
fi

echo -e "${GREEN}Docker version:${NC}"
docker --version
echo ""

# Parse arguments
DEBUG_DOCKERFILE=false
PLATFORM="linux/amd64"
NO_CACHE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --debug)
            DEBUG_DOCKERFILE=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --debug          Use Dockerfile.debug for minimal testing"
            echo "  --platform ARCH  Set platform (default: linux/amd64)"
            echo "  --no-cache       Build without cache"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Set build context
BUILD_CONTEXT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
DOCKERFILE_PATH="${BUILD_CONTEXT}/infra/Dockerfile.infra"

if [ "$DEBUG_DOCKERFILE" = true ]; then
    echo -e "${RED}Debug Dockerfile no longer exists - using standard infra Dockerfile${NC}"
fi

# Build arguments
BUILD_ARGS=(
    "--file" "$DOCKERFILE_PATH"
    "--platform" "$PLATFORM"
    "--progress" "plain"
    "--tag" "codebot-debug:latest"
)

if [ "$NO_CACHE" = true ]; then
    BUILD_ARGS+=("--no-cache")
fi

echo -e "${GREEN}Building Docker image...${NC}"
echo "Context: $BUILD_CONTEXT"
echo "Dockerfile: $DOCKERFILE_PATH"
echo "Platform: $PLATFORM"
echo ""

# Run the build
if docker build "${BUILD_ARGS[@]}" "$BUILD_CONTEXT"; then
    echo -e "${GREEN}Build successful!${NC}"
    
    if [ "$DEBUG_DOCKERFILE" = true ]; then
        echo ""
        echo -e "${GREEN}You can now run the debug container with:${NC}"
        echo "docker run -it --rm codebot-debug:latest"
    fi
else
    echo -e "${RED}Build failed!${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Try building with --no-cache flag"
    echo "2. Try building with --debug flag to use minimal Dockerfile"
    echo "3. Check network connectivity: curl -I https://install.determinate.systems"
    echo "4. Try building for a single platform: --platform linux/amd64"
    echo ""
    echo "To see more details, you can also try:"
    echo "DOCKER_BUILDKIT=0 docker build --no-cache -f $DOCKERFILE_PATH $BUILD_CONTEXT"
    exit 1
fi