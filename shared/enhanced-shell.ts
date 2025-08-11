#!/usr/bin/env -S deno run --allow-all

/**
 * Enhanced Shell - A shell wrapper that improves error messages
 * Usage: enhanced-shell [shell-path]
 */

import { readLines } from "https://deno.land/std@0.210.0/io/mod.ts";

const ERROR_MAPPINGS = [
  {
    pattern: /cannot access ['"]?glob['"]?/,
    replace: "No files matched the glob pattern",
    hint: "Check if the directory exists and files match the pattern"
  },
  {
    pattern: /No such file or directory/,
    replace: "Path not found",
    hint: "Use 'ls' to see available files, or 'pwd' to check location"
  },
  {
    pattern: /Permission denied/,
    replace: "Access denied",
    hint: "Check permissions with 'ls -la' or try 'sudo'"
  },
  {
    pattern: /command not found/,
    replace: "Command not available",
    hint: "Check spelling or install the required package"
  }
];

function enhanceError(text: string): string {
  let enhanced = text;
  let hintAdded = false;
  
  for (const mapping of ERROR_MAPPINGS) {
    if (mapping.pattern.test(text)) {
      enhanced = text.replace(mapping.pattern, `❌ ${mapping.replace}`);
      if (!hintAdded && mapping.hint) {
        enhanced += `\n💡 Hint: ${mapping.hint}`;
        hintAdded = true;
      }
    }
  }
  
  return enhanced;
}

async function runEnhancedShell() {
  const shell = Deno.args[0] || Deno.env.get("SHELL") || "/bin/bash";
  
  console.log(`🚀 Enhanced Shell (wrapping ${shell})`);
  console.log("Type 'exit' to quit\n");
  
  // Create a PTY for the shell
  const pty = new Deno.Command(shell, {
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  
  const process = pty.spawn();
  
  // Handle stdout
  const stdoutReader = process.stdout.getReader();
  const decoder = new TextDecoder();
  
  (async () => {
    try {
      while (true) {
        const { done, value } = await stdoutReader.read();
        if (done) break;
        const text = decoder.decode(value);
        await Deno.stdout.write(new TextEncoder().encode(text));
      }
    } catch (e) {
      console.error("stdout error:", e);
    }
  })();
  
  // Handle stderr with enhancement
  const stderrReader = process.stderr.getReader();
  
  (async () => {
    try {
      while (true) {
        const { done, value } = await stderrReader.read();
        if (done) break;
        const text = decoder.decode(value);
        const enhanced = enhanceError(text);
        await Deno.stderr.write(new TextEncoder().encode(enhanced));
      }
    } catch (e) {
      console.error("stderr error:", e);
    }
  })();
  
  // Forward stdin
  const encoder = new TextEncoder();
  for await (const line of readLines(Deno.stdin)) {
    await process.stdin.write(encoder.encode(line + "\n"));
  }
  
  await process.status;
}

if (import.meta.main) {
  runEnhancedShell();
}