import { assert } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";

const logger = getLogger(import.meta);

Deno.test("CSS loading - inline and external CSS on home page", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Navigate to the home page (where our test squares are)
    await navigateTo(context, "/");

    // Take screenshot of home page to verify CSS squares are visible
    await context.takeScreenshot("css-test-home-page");

    // Verify professional CSS styling is loaded correctly
    const cssLoadingStatus = await context.__UNSAFE_evaluate(() => {
      // Check for landing page wrapper with proper class
      const landingPage = document.querySelector(".landing-page");
      const hasLandingPageClass = landingPage !== null;

      // Check for hero section with professional styling
      const heroSection = document.querySelector(".hero-section");
      const hasHeroSection = heroSection !== null;
      let heroSectionStyled = false;
      if (heroSection) {
        const styles = globalThis.getComputedStyle(heroSection);
        // Check for flexbox display which is set by .flexColumn class
        heroSectionStyled = styles.display === "flex";
      }

      // Check for professional typography classes
      const mainHeading = document.querySelector("h1.main");
      const hasMainHeading = mainHeading !== null;
      let mainHeadingStyled = false;
      if (mainHeading) {
        const styles = globalThis.getComputedStyle(mainHeading);
        // Should have large font size from landingStyle.css
        mainHeadingStyled = parseFloat(styles.fontSize) > 40; // 4em should be > 40px
      }

      return {
        landingPageClass: hasLandingPageClass,
        heroSectionPresent: hasHeroSection,
        heroSectionStyled: heroSectionStyled,
        mainHeadingPresent: hasMainHeading,
        mainHeadingStyled: mainHeadingStyled,
        allDivs: Array.from(document.querySelectorAll("div")).length,
        pageText: document.body.textContent?.substring(0, 200),
      };
    });

    logger.info(`CSS loading status:`, cssLoadingStatus);

    // Verify the page loaded correctly first with generic content check
    assert(
      cssLoadingStatus.pageText && cssLoadingStatus.pageText.length > 100,
      "Home page should contain substantial content",
    );

    // Verify landing page wrapper class is applied
    assert(
      cssLoadingStatus.landingPageClass,
      "Landing page should have .landing-page class applied",
    );

    // Verify hero section exists and is styled
    assert(
      cssLoadingStatus.heroSectionPresent,
      "Hero section with .hero-section class should exist in DOM",
    );

    // Verify hero section has proper styling from external CSS
    assert(
      cssLoadingStatus.heroSectionStyled,
      "Hero section should be styled with flexbox from external CSS",
    );

    // Verify main heading has professional typography
    assert(
      cssLoadingStatus.mainHeadingPresent && cssLoadingStatus.mainHeadingStyled,
      "Main heading should have large font size from professional CSS",
    );

    // Check that the bundled CSS file is loaded correctly
    const cssInfo = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        const cssLinks = Array.from(
          document.querySelectorAll('link[rel="stylesheet"]'),
        );
        return {
          cssLinksCount: cssLinks.length,
          cssHrefs: cssLinks.map((link) => link.getAttribute("href")),
          hasBundledCSS: cssLinks.some((link) => {
            const href = link.getAttribute("href");
            return href && href.includes("/static/build/assets/") &&
              href.includes(".css");
          }),
        };
      });

    logger.info("CSS loading info:", cssInfo);

    assert(
      cssInfo.hasBundledCSS,
      "Bundled CSS file should be loaded from /static/build/assets/",
    );

    assert(
      cssInfo.cssLinksCount > 0,
      "At least one CSS file should be loaded",
    );

    // Take a final screenshot showing the successful state
    await context.takeScreenshot("css-test-success");

    logger.info(
      "CSS loading test completed successfully - both inline and external CSS working",
    );
  } catch (error) {
    await context.takeScreenshot("css-test-error");
    logger.error("CSS loading test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});
