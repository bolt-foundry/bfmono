#!/bin/bash
# Enhanced Shell Initialization
# Source this file in your .bashrc or .zshrc

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Error enhancement database
declare -gA ERROR_ENHANCEMENTS=(
    ["cannot access 'glob'"]="No files matched the pattern|Check if directory exists and files match the pattern"
    ["No such file or directory"]="Path not found|Try 'ls' to see files or 'pwd' for current location"
    ["Permission denied"]="Access denied|Check permissions with 'ls -la' or use 'sudo'"
    ["command not found"]="Command not available|Check spelling or install required package"
    ["segmentation fault"]="Program crashed|This is a serious error - check core dumps"
    ["broken pipe"]="Connection lost|The receiving process ended unexpectedly"
    ["is a directory"]="Tried to open directory as file|Use 'cd' to enter or 'ls' to list"
)

# Function to enhance error output
enhance_error() {
    local error_text="$1"
    
    for pattern in "${!ERROR_ENHANCEMENTS[@]}"; do
        if [[ "$error_text" =~ $pattern ]]; then
            IFS='|' read -r replacement hint <<< "${ERROR_ENHANCEMENTS[$pattern]}"
            echo -e "\n${RED}❌ $replacement${NC}"
            echo -e "${YELLOW}💡 Hint: $hint${NC}"
            return 0
        fi
    done
    
    # If no enhancement found, return original
    echo "$error_text"
}

# Bash-specific implementation
if [ -n "$BASH_VERSION" ]; then
    # Override command execution with error enhancement
    debug_trap() {
        # Save the command about to be executed
        LAST_COMMAND=$BASH_COMMAND
    }
    
    error_trap() {
        local exit_code=$?
        if [ $exit_code -ne 0 ] && [ -n "$LAST_COMMAND" ]; then
            # Capture and enhance any error output
            # This is tricky because the error has already been printed
            # We'll provide context after the fact
            echo -e "${YELLOW}💡 Command failed: $LAST_COMMAND (exit code: $exit_code)${NC}"
            
            # Common error code meanings
            case $exit_code in
                1) echo "General error - check command output above" ;;
                2) echo "Misuse of shell command" ;;
                126) echo "Command cannot execute (permission problem?)" ;;
                127) echo "Command not found" ;;
                128) echo "Invalid argument to exit" ;;
                130) echo "Terminated by Ctrl+C" ;;
            esac
        fi
    }
    
    # Set up traps
    trap debug_trap DEBUG
    trap error_trap ERR
    
    # Enable error trapping for all commands
    set -E
fi

# ZSH-specific implementation
if [ -n "$ZSH_VERSION" ]; then
    # ZSH has preexec and precmd hooks
    preexec() {
        LAST_COMMAND=$1
    }
    
    precmd() {
        local exit_code=$?
        if [ $exit_code -ne 0 ] && [ -n "$LAST_COMMAND" ]; then
            echo -e "${YELLOW}💡 Command failed: $LAST_COMMAND (exit code: $exit_code)${NC}"
        fi
    }
fi

# Universal command wrapper function
run() {
    local output
    local exit_code
    
    # Run command and capture output
    output=$("$@" 2>&1)
    exit_code=$?
    
    # Print output
    echo "$output"
    
    # Enhance errors if command failed
    if [ $exit_code -ne 0 ]; then
        enhance_error "$output" >&2
    fi
    
    return $exit_code
}

# Alias common commands to use error enhancement
# Users can opt-in by uncommenting these
# alias ls='run ls'
# alias cd='run cd'
# alias cat='run cat'

# Better glob handling
safe_glob() {
    local pattern="$1"
    shift
    local matches=()
    
    # Enable nullglob temporarily
    local saved_nullglob=$(shopt -p nullglob 2>/dev/null || true)
    shopt -s nullglob 2>/dev/null || setopt nullglob 2>/dev/null || true
    
    # Expand pattern
    matches=($pattern)
    
    # Restore nullglob setting
    eval "$saved_nullglob" 2>/dev/null || true
    
    # Check if we got matches
    if [ ${#matches[@]} -eq 0 ]; then
        echo -e "${RED}❌ No files matched pattern: $pattern${NC}" >&2
        echo -e "${YELLOW}💡 Hint: Check current directory with 'pwd' and list files with 'ls'${NC}" >&2
        return 1
    fi
    
    # Execute command with matches
    "$@" "${matches[@]}"
}

# Export functions
export -f enhance_error run safe_glob 2>/dev/null || true

echo -e "${GREEN}✨ Enhanced shell initialized!${NC}"
echo "Commands available:"
echo "  • run <command>     - Run command with enhanced errors"
echo "  • safe_glob <pattern> <command> - Handle globs safely"
echo "  • Error messages will be automatically enhanced"