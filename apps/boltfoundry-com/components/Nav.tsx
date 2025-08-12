import { useState } from "react";

import { BfLogo } from "@bfmono/apps/cfDs/static/BfLogo.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useHud } from "@bfmono/apps/bfDs/index.ts";

type Props = {
  page?: string;
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
};

export function Nav({ page, onSidebarToggle, sidebarOpen }: Props) {
  const [hoverLogo, setHoverLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isVisible: hudOpen, toggleHud } = useHud();

  // Temporary organization variable - replace with actual user org check
  const organization = "boltfoundry";

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
        <BfDsButton
          variant={page === "settings" ? "primary" : "outline"}
          overlay={page !== "settings"}
          link="/settings"
        >
          Settings
        </BfDsButton>
        <BfDsButton
          variant={page === "login" ? "secondary" : "outline-secondary"}
          link="/login"
        >
          Login
        </BfDsButton>
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
