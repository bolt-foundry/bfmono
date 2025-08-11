#!/usr/bin/env -S deno run --allow-all --unstable-pty

/**
 * PTY Shell Wrapper - Intercepts and enhances all shell output
 * This wraps your entire shell session transparently
 */

const ERROR_PATTERNS = [
  {
    pattern: /cannot access ['"]?glob['"]?: No such file or directory/,
    enhancement: () => `\n💡 No files matched the glob pattern. The shell couldn't expand the wildcard.\n   Try: ls <directory> to see what files exist`,
  },
  {
    pattern: /ls: cannot access ['"]([^'"]+)['"]: No such file or directory/,
    enhancement: (match: RegExpMatchArray) => `\n💡 File or pattern '${match[1]}' not found.\n   This often happens with unmatched wildcards like *.png`,
  },
  {
    pattern: /bash: ([^:]+): command not found/,
    enhancement: (match: RegExpMatchArray) => `\n💡 Command '${match[1]}' not found.\n   Try: which ${match[1]} or apt install <package>`,
  },
  {
    pattern: /Permission denied/,
    enhancement: () => `\n💡 Access denied. Try:\n   • sudo <command>\n   • Check permissions: ls -la`,
  },
];

class EnhancedShell {
  private decoder = new TextDecoder();
  private encoder = new TextEncoder();
  private buffer = "";
  
  async run() {
    const shell = Deno.env.get("SHELL") || "/bin/bash";
    
    // Create PTY
    const pty = new (Deno as any).Pty({
      cmd: [shell, "--login"],
      env: Deno.env.toObject(),
    });
    
    console.log("🚀 Enhanced Shell Active - Error messages will be improved");
    console.log("Type 'exit' to quit\n");
    
    // Handle PTY output
    this.handleOutput(pty);
    
    // Handle user input
    this.handleInput(pty);
    
    // Wait for shell to exit
    await pty.status;
    console.log("\n👋 Enhanced Shell closed");
  }
  
  private async handleOutput(pty: any) {
    const reader = pty.readable.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = this.decoder.decode(value);
        
        // Buffer output for pattern matching
        this.buffer += text;
        
        // Check for complete lines
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || "";
        
        // Process complete lines
        for (const line of lines) {
          const enhanced = this.enhanceLine(line);
          await Deno.stdout.write(this.encoder.encode(enhanced + '\n'));
        }
        
        // Write incomplete line
        if (this.buffer.length > 0) {
          const enhanced = this.enhanceLine(this.buffer);
          await Deno.stdout.write(this.encoder.encode(enhanced));
          this.buffer = "";
        }
      }
    } catch (e) {
      console.error("Output error:", e);
    }
  }
  
  private enhanceLine(line: string): string {
    let enhanced = line;
    
    for (const { pattern, enhancement } of ERROR_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        enhanced = line + enhancement(match);
        break;
      }
    }
    
    return enhanced;
  }
  
  private async handleInput(pty: any) {
    // Set stdin to raw mode
    Deno.stdin.setRaw(true);
    
    const writer = pty.writable.getWriter();
    
    try {
      for await (const chunk of Deno.stdin.readable) {
        await writer.write(chunk);
      }
    } catch (e) {
      console.error("Input error:", e);
    } finally {
      Deno.stdin.setRaw(false);
    }
  }
}

if (import.meta.main) {
  const shell = new EnhancedShell();
  await shell.run();
}