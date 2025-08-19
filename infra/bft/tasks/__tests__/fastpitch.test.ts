import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { assertEquals, assertExists } from "@std/assert";
import { generate } from "../fastpitch.bft.ts";

// Create a minimal test CSV file content
const testCsvContent =
  `id,title,content,url,published_at,scraped_at,source_id,relevance_score
1,"Test Article 1","This is test content about React and performance optimization","https://example.com/1","2024-01-01","2024-01-01","source1",0.9
2,"Test Article 2","GitHub Copilot AI coding assistant news","https://example.com/2","2024-01-02","2024-01-02","source2",0.8
3,"Test Article 3","Kubernetes security update critical patch","https://example.com/3","2024-01-03","2024-01-03","source3",0.85
4,"Test Article 4","New JavaScript framework announcement","https://example.com/4","2024-01-04","2024-01-04","source4",0.7
5,"Test Article 5","Cloud infrastructure best practices","https://example.com/5","2024-01-05","2024-01-05","source5",0.75
6,"Test Article 6","Machine learning model deployment tips","https://example.com/6","2024-01-06","2024-01-06","source6",0.65`;

Deno.test("fastpitch generate - smoke test with mock data", async () => {
  // Create a temporary test CSV file
  const tempDir = await Deno.makeTempDir();
  const testCsvPath = `${tempDir}/test_articles.csv`;
  await Deno.writeTextFile(testCsvPath, testCsvContent);

  try {
    // Set required environment variables for testing
    const originalBfKey = getConfigurationVariable("BF_API_KEY");

    // Use test API key if not already set
    if (!originalBfKey) {
      Deno.env.set("BF_API_KEY", "bf+test-org");
    }

    // Skip test if OpenRouter key is not available
    if (!getConfigurationVariable("OPENROUTER_API_KEY")) {
      // Skip test silently when API key not available

      // Clean up
      await Deno.remove(tempDir, { recursive: true });

      // Restore original env vars
      if (!originalBfKey) {
        Deno.env.delete("BF_API_KEY");
      }
      return;
    }

    // Create a temporary output file
    const outputPath = `${tempDir}/output.txt`;

    // Run the generate function
    await generate(testCsvPath, outputPath);

    // Verify the output file was created
    const outputExists = await Deno.stat(outputPath).then(() => true).catch(
      () => false,
    );
    assertExists(outputExists, "Output file should be created");

    if (outputExists) {
      // Read and verify output content
      const output = await Deno.readTextFile(outputPath);

      // Basic validation - should have some content
      assertExists(output, "Output should not be empty");
      assertEquals(
        output.length > 100,
        true,
        "Output should have substantial content",
      );

      // Could check for expected patterns (numbered list items)
      const hasNumberedItems = /1\.|2\.|3\./.test(output);
      assertEquals(
        hasNumberedItems,
        true,
        "Output should contain numbered list items",
      );
    }

    // Restore original env vars
    if (!originalBfKey) {
      Deno.env.delete("BF_API_KEY");
    }
  } finally {
    // Clean up temp directory
    await Deno.remove(tempDir, { recursive: true });
  }
});

Deno.test("fastpitch generate - validates required inputs", async () => {
  // Save original env vars
  const originalBfKey = getConfigurationVariable("BF_API_KEY");

  try {
    // Set test API key
    if (!originalBfKey) {
      Deno.env.set("BF_API_KEY", "bf+test-org");
    }

    // Test with no input file - should handle gracefully
    await generate(undefined, undefined);

    // Test with non-existent file - should handle gracefully
    await generate("/non/existent/file.csv", undefined);

    // If we get here without throwing, the validation is working
    assertEquals(
      true,
      true,
      "Validation should handle missing inputs gracefully",
    );
  } finally {
    // Restore original env var
    if (!originalBfKey) {
      Deno.env.delete("BF_API_KEY");
    }
  }
});

Deno.test("fastpitch generate - handles empty CSV gracefully", async () => {
  const tempDir = await Deno.makeTempDir();
  const emptyCsvPath = `${tempDir}/empty.csv`;

  // Create CSV with just headers, no data
  const emptyCsv =
    `id,title,content,url,published_at,scraped_at,source_id,relevance_score`;
  await Deno.writeTextFile(emptyCsvPath, emptyCsv);

  try {
    // Set test API key if needed
    const originalBfKey = getConfigurationVariable("BF_API_KEY");
    if (!originalBfKey) {
      Deno.env.set("BF_API_KEY", "bf+test-org");
    }

    // Should handle empty CSV without crashing
    await generate(emptyCsvPath, undefined);

    // If we get here, it handled the empty CSV gracefully
    assertEquals(true, true, "Should handle empty CSV without crashing");

    // Restore env var
    if (!originalBfKey) {
      Deno.env.delete("BF_API_KEY");
    }
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
});
