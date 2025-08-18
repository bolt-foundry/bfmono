/**
 * Shared utilities for environment variable handling
 */

/**
 * Parse a .env file content into key-value pairs
 */
export function parseEnvFile(content: string): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Find the first = sign
    const equalIndex = trimmed.indexOf("=");
    if (equalIndex === -1) continue;

    const key = trimmed.substring(0, equalIndex).trim();
    let value = trimmed.substring(equalIndex + 1).trim();

    // Remove surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Handle escaped characters
    value = value
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\\\/g, "\\")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'");

    vars[key] = value;
  }

  return vars;
}

/**
 * Format environment variables for writing to a file
 */
export function formatEnvFile(vars: Record<string, string>): string {
  const lines: Array<string> = [];

  for (const [key, value] of Object.entries(vars)) {
    let formattedValue = value;

    // Check if value needs quoting
    if (
      value.includes(" ") ||
      value.includes("\n") ||
      value.includes('"') ||
      value.includes("'") ||
      value.includes("=")
    ) {
      // Escape special characters
      formattedValue = value
        .replace(/\\/g, "\\\\") // Escape backslashes first
        .replace(/"/g, '\\"') // Escape double quotes
        .replace(/\n/g, "\\n") // Escape newlines
        .replace(/\r/g, "\\r") // Escape carriage returns
        .replace(/\t/g, "\\t"); // Escape tabs

      formattedValue = `"${formattedValue}"`;
    }

    lines.push(`${key}=${formattedValue}`);
  }

  return lines.join("\n") + "\n";
}
