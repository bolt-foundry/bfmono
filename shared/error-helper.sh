#!/bin/bash
# Error Helper - Makes shell errors more user-friendly

# Error translation database
declare -A ERROR_HINTS=(
    ["cannot access 'glob'"]="No files matched the pattern. Check if:\n  • The directory exists\n  • Files with that extension exist\n  • You have read permissions"
    ["No such file or directory"]="Path not found. Try:\n  • ls to see available files\n  • pwd to check current directory\n  • Use tab completion"
    ["Permission denied"]="Access denied. Solutions:\n  • Check file permissions with ls -la\n  • Use sudo if appropriate\n  • Check file ownership"
    ["command not found"]="Command doesn't exist. Try:\n  • Check spelling\n  • Install the package\n  • Use 'which' to find the command"
)

# Function to provide helpful error messages
explain_error() {
    local error_msg="$1"
    
    for pattern in "${!ERROR_HINTS[@]}"; do
        if [[ "$error_msg" =~ $pattern ]]; then
            echo -e "\n💡 Hint: ${ERROR_HINTS[$pattern]}"
            return
        fi
    done
}

# Wrapper function for commands with better errors
run_with_help() {
    local output
    local exit_code
    
    # Capture both stdout and stderr
    output=$("$@" 2>&1)
    exit_code=$?
    
    # Print the output
    echo "$output"
    
    # If command failed, provide hints
    if [ $exit_code -ne 0 ]; then
        explain_error "$output"
    fi
    
    return $exit_code
}

# Specific helpers for common operations
safe_glob() {
    local pattern="$1"
    local matches=($pattern)
    
    if [ ${#matches[@]} -eq 1 ] && [ "${matches[0]}" = "$pattern" ]; then
        echo "❌ No files matching pattern: $pattern"
        echo "💡 Try: ls $(dirname "$pattern" 2>/dev/null || echo ".")"
        return 1
    else
        printf '%s\n' "${matches[@]}"
    fi
}

# Export functions for use in shell
export -f explain_error run_with_help safe_glob