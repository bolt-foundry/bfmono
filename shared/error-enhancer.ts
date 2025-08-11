#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env

/**
 * Error Enhancer - Intercepts and improves error messages
 * Usage: error-enhancer <command> [args...]
 */

interface ErrorMapping {
  pattern: RegExp;
  replacement: string;
  hint?: string;
  suggestions?: string[];
}

const errorMappings: ErrorMapping[] = [
  {
    pattern: /cannot access ['"]glob['"]/,
    replacement: "No files matched the pattern",
    hint: "The glob pattern didn't match any files",
    suggestions: [
      "Check if the directory exists",
      "Verify the file extension",
      "Use 'ls' to see available files"
    ]
  },
  {
    pattern: /No such file or directory/,
    replacement: "File or directory not found",
    hint: "The specified path doesn't exist",
    suggestions: [
      "Check your current directory with 'pwd'",
      "List files with 'ls'",
      "Use tab completion to verify paths"
    ]
  },
  {
    pattern: /Permission denied/,
    replacement: "Access denied",
    hint: "You don't have permission to access this",
    suggestions: [
      "Check permissions with 'ls -la'",
      "Try with 'sudo' if appropriate",
      "Check file ownership"
    ]
  },
  {
    pattern: /command not found/,
    replacement: "Command not found",
    hint: "The command doesn't exist in your PATH",
    suggestions: [
      "Check spelling",
      "Install the required package",
      "Use 'which' to locate commands"
    ]
  }
];

function enhanceError(error: string): string {
  let enhanced = error;
  let hints: string[] = [];
  
  for (const mapping of errorMappings) {
    if (mapping.pattern.test(error)) {
      enhanced = error.replace(mapping.pattern, mapping.replacement);
      
      if (mapping.hint) {
        hints.push(`💡 ${mapping.hint}`);
      }
      
      if (mapping.suggestions && mapping.suggestions.length > 0) {
        hints.push("📋 Suggestions:");
        hints.push(...mapping.suggestions.map(s => `   • ${s}`));
      }
    }
  }
  
  if (hints.length > 0) {
    return `${enhanced}\n\n${hints.join('\n')}`;
  }
  
  return enhanced;
}

async function main() {
  const args = Deno.args;
  
  if (args.length === 0) {
    console.error("Usage: error-enhancer <command> [args...]");
    Deno.exit(1);
  }
  
  const command = new Deno.Command(args[0], {
    args: args.slice(1),
    stdout: "piped",
    stderr: "piped",
  });
  
  const process = command.spawn();
  
  // Handle stdout
  const stdout = process.stdout.pipeThrough(new TextDecoderStream());
  for await (const chunk of stdout) {
    await Deno.stdout.write(new TextEncoder().encode(chunk));
  }
  
  // Handle stderr with enhancement
  const stderr = process.stderr.pipeThrough(new TextDecoderStream());
  for await (const chunk of stderr) {
    const enhanced = enhanceError(chunk);
    await Deno.stderr.write(new TextEncoder().encode(enhanced));
  }
  
  const status = await process.status;
  Deno.exit(status.code);
}

if (import.meta.main) {
  main();
}