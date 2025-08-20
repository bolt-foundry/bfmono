/**
 * Example usage of the human-mouse library
 */

import { MouseController } from "./mod.ts";

async function example() {
  console.log("Human Mouse TypeScript Example");
  console.log("==============================");

  // Create a new mouse controller
  const mouse = new MouseController({
    speedFactor: 1.5,
    virtualDisplay: false,
  });

  console.log("Initial position:", mouse.getCurrentPosition());

  // Move to a specific coordinate
  console.log("\n1. Moving to (500, 300)...");
  await mouse.move(500, 300);
  console.log("New position:", mouse.getCurrentPosition());

  // Perform a click
  console.log("\n2. Performing a left click...");
  await mouse.performClick();

  // Move and click in one operation
  console.log("\n3. Moving to (800, 600) and clicking...");
  await mouse.moveAndClick(800, 600);

  // Perform a double click
  console.log("\n4. Performing a double click...");
  await mouse.performDoubleClick();

  // Perform a right click
  console.log("\n5. Performing a right click...");
  await mouse.performContextClick();

  // Move to random location
  console.log("\n6. Moving to random location...");
  await mouse.moveRandom(2.0);
  console.log("Random position:", mouse.getCurrentPosition());

  console.log("\nExample completed!");
}

// Run the example
if (import.meta.main) {
  example().catch(console.error);
}
