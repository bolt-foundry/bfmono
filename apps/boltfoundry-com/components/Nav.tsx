import { useEffect, useState } from "react";

import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useHud } from "@bfmono/apps/bfDs/index.ts";
import { BfLogo } from "@bfmono/apps/bfDs/logo/BfLogo.tsx";

type Props = {
  page?: string;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
  currentViewer?: any;
};

// Custom hook for fetching currentViewer (fallback for non-Isograph pages)
function useCurrentViewer() {
  const [currentViewer, setCurrentViewer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentViewer = async () => {
      try {
        const response = await fetch("/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                currentViewer {
                  __typename
                  id
                  personBfGid
                  orgBfOid
                  ... on CurrentViewerLoggedIn {
                    person {
                      id
                      name
                      email
                    }
                    organization {
                      id
                      name
                      domain
                    }
                  }
                }
              }
            `,
          }),
        });
        const result = await response.json();
        setCurrentViewer(result.data?.currentViewer);
      } catch (error) {
        console.error("Failed to fetch currentViewer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentViewer();
  }, []);

  return { currentViewer, loading };
}

export function Nav(
  { page, onSidebarToggle, sidebarOpen, currentViewer: propCurrentViewer }:
    Props,
) {
  const [hoverLogo, setHoverLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isVisible: hudOpen, toggleHud } = useHud();

  // Use fallback hook only if no currentViewer prop is provided
  const { currentViewer: hookCurrentViewer, loading } = propCurrentViewer
    ? { currentViewer: null, loading: false }
    : useCurrentViewer();
  const currentViewer = propCurrentViewer || hookCurrentViewer;

  let organization = "boltfoundry"; // fallback
  if (currentViewer?.asCurrentViewerLoggedIn?.organization) {
    organization = currentViewer.asCurrentViewerLoggedIn.organization.domain;
  } else if (currentViewer?.organization) {
    organization = currentViewer.organization.domain;
  }

  const NavButtons = () => {
    return (
      <>
        <BfDsButton
          variant="outline"
          overlay
          href="https://github.com/bolt-foundry/bolt-foundry"
          target="_blank"
          rel="noopener noreferrer"
          icon="brand-github"
          iconOnly
          size="small"
        />
        <BfDsButton
          variant="outline"
          overlay
          href="https://discord.gg/tU5ksTBfEj"
          target="_blank"
          rel="noopener noreferrer"
          icon="brand-discord"
          iconOnly
          size="small"
        />
        <div className="navSeparator" />
        {page !== "home" && (
          <BfDsButton
            variant="outline"
            link="/"
            overlay
            icon="home"
          />
        )}
        {
          /* <BfDsButton
          variant={page === "blog" ? "primary" : "outline"}
          overlay={page !== "blog"}
          href="/blog"
          target="_top"
        >
          Blog
        </BfDsButton>
        <BfDsButton
          variant={page === "docs" ? "primary" : "outline"}
          overlay={page !== "docs"}
          href="/docs"
          target="_top"
        >
          Docs
        </BfDsButton>
        <BfDsButton
          variant={page === "eval" ? "primary" : "outline"}
          overlay={page !== "eval"}
          link="/eval"
        >
          Eval
        </BfDsButton>
        <BfDsButton
          variant={page === "ui" ? "primary" : "outline"}
          overlay={page !== "ui"}
          link="/ui"
        >
          UI Demo
        </BfDsButton> */
        }
        {(currentViewer?.asCurrentViewerLoggedIn ||
            (currentViewer?.__typename === "CurrentViewerLoggedIn"))
          ? (
            <BfDsButton
              variant="outline-secondary"
              icon="user"
              link="/logout"
            >
              {currentViewer.asCurrentViewerLoggedIn?.person?.name ||
                currentViewer.person?.name ||
                currentViewer.asCurrentViewerLoggedIn?.organization?.name ||
                currentViewer.organization?.name ||
                "User"}
            </BfDsButton>
          )
          : (
            <BfDsButton
              variant={page === "login" ? "secondary" : "outline-secondary"}
              link="/login"
            >
              Login
            </BfDsButton>
          )}
      </>
    );
  };

  return (
    <header className="landing-header flexRow">
      <div className="flex1 selfAlignCenter">
        {onSidebarToggle && (
          <div className="landing-header-sidebar-button">
            <BfDsButton
              variant={sidebarOpen ? "primary" : "ghost"}
              icon={sidebarOpen ? "sidebarClose" : "sidebarOpen"}
              iconOnly
              size="medium"
              onClick={onSidebarToggle}
              style={{ marginRight: "1rem" }}
            />
          </div>
        )}
      </div>
      <div className="landing-content flexRow gapLarge">
        <div className="flex1 flexRow alignItemsCenter gapMedium">
          <a
            className="header-logo clickable"
            href="/"
            onMouseEnter={() => setHoverLogo(true)}
            onMouseLeave={() => setHoverLogo(false)}
          >
            <BfLogo
              boltColor={hoverLogo ? "var(--bfds-primary)" : "var(--bfds-text)"}
              foundryColor={hoverLogo
                ? "var(--bfds-primary)"
                : "var(--bfds-text)"}
              height={24}
            />
          </a>
          {organization === "boltfoundry" && (
            <BfDsButton
              variant={hudOpen ? "primary" : "ghost"}
              icon="hud"
              onClick={toggleHud}
              data-testid="header-hud"
            />
          )}
        </div>
        <div className="mobile-hide">
          <nav className="alignItemsCenter flexRow gapLarge header-nav">
            <NavButtons />
          </nav>
        </div>
        <nav className="mobile-show">
          <BfDsButton
            variant={showMenu ? "primary" : "ghost"}
            icon="menu"
            onClick={() => {
              setShowMenu(!showMenu);
            }}
          />
        </nav>
        {showMenu && (
          <div className="flexRow gapLarge sidebar-nav mobile-show-opacity">
            <NavButtons />
          </div>
        )}
      </div>
      <div className="flex1 selfAlignCenter" />
    </header>
  );
}
