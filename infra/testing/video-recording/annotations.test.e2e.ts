import { setupE2ETest, teardownE2ETest } from "../e2e/setup.ts";

Deno.test("Basic annotation API test", async () => {
  const context = await setupE2ETest();

  try {
    const { stop, showSubtitle, highlightElement } = await context
      .startRecording("test");

    // Navigate to a test page with more content
    await context.__UNSAFE_page_useContextMethodsInstead.goto(
      "data:text/html,<h1>Demo Application</h1><p>This is a test page for annotations</p><button id='login'>Login</button><input type='text' placeholder='Username' id='username'><div style='margin-top:20px;'><button id='submit'>Submit Form</button></div>",
    );
    await context.__UNSAFE_page_useContextMethodsInstead.waitForSelector(
      "button",
      { timeout: 5000 },
    );

    // Show welcome subtitle
    await showSubtitle("Welcome to our annotation demo! 🎉");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Highlight the login button
    await highlightElement("#login", "This is the login button 👆");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Actually click the login button with smooth animation
    await context.click("#login");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Change subtitle
    await showSubtitle("Now let's look at the input field");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Highlight input field
    await highlightElement("#username", "Enter your username here ✍️");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Type in the input field with smooth typing
    await context.type("#username", "demo-user");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Final highlight
    await showSubtitle("And here's the submit button");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await highlightElement("#submit", "Click to submit! 🚀");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Click the submit button
    await context.click("#submit");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test screenshot annotation control
    await context.takeScreenshot("clean-screenshot"); // Should hide annotations
    await context.takeScreenshot("annotated-screenshot", {
      showAnnotations: true,
    }); // Should show annotations

    // Final subtitle
    await showSubtitle("Demo complete! Thanks for watching 👋");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await stop();
  } finally {
    await teardownE2ETest(context);
  }
});
