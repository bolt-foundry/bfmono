import { useRef } from "react";
import { iso } from "@iso-bfc";
import { BfDsButton } from "@bfmono/apps/bfDs/index.ts";
import { Nav } from "@bfmono/apps/boltfoundry-com/components/Nav.tsx";
import { WaitlistSection } from "@bfmono/apps/boltfoundry-com/components/WaitlistSection.tsx";

export const Home = iso(`
  field Query.Home @component {
    __typename
    githubRepoStats {
      stars
    }
  }
`)(function Home({ data }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (heroRef.current) {
      heroRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToWaitlist = () => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Header */}
      <Nav page="home" />

      {/* Hero Section */}
      <main className="hero-section flexColumn" ref={heroRef}>
        <div className="landing-content">
          <div className="hero-content">
            {/* GitHub button */}
            <BfDsButton
              variant="ghost"
              icon="brand-github"
              href="https://github.com/bolt-foundry/bolt-foundry"
              target="_blank"
            >
              {data?.githubRepoStats?.stars.toString() ?? "--"}
            </BfDsButton>

            <h1 className="main">
              Understand what your LLM is really doing
            </h1>
            <p>
              Context Engineering tools to turn AI development from art to
              science
            </p>

            {/* NPM Install Section */}
            <div className="npm-command-container flexRow flexWrap gapMedium">
              <BfDsButton onClick={scrollToWaitlist}>
                Stay updated
              </BfDsButton>
            </div>
          </div>
        </div>
        <div className="more-content flexCenter flexColumn mobile-hide">
          <BfDsButton
            variant="ghost-primary"
            icon="arrowDown"
            iconOnly
            onClick={scrollToWaitlist}
          />
        </div>
      </main>

      {/* Content */}
      <section className="page-content">
        <div className="landing-content" ref={contentRef}>
          <WaitlistSection actionButton={scrollToTop} />
        </div>

        {/* Footer */}
        <div className="landing-footer">
          <div className="landing-content flexRow gapMedium alignItemsCenter">
            <div className="flex1">
              &copy; 2025 Bolt Foundry. All rights reserved.
            </div>
            <BfDsButton
              size="small"
              variant="ghost"
              icon="brand-discord"
              iconOnly
              href="https://discord.gg/tU5ksTBfEj"
              target="_blank"
            />
            <BfDsButton
              size="small"
              variant="ghost"
              icon="brand-github"
              iconOnly
              href="https://github.com/bolt-foundry/bolt-foundry"
              target="_blank"
            />
          </div>
        </div>
      </section>
    </div>
  );
});
