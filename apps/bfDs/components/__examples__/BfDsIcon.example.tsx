import { useEffect, useState } from "react";
import {
  BfDsIcon,
  type BfDsIconName,
  type BfDsIconSize,
} from "../BfDsIcon.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsBadge } from "../BfDsBadge.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";
import { icons } from "@bfmono/apps/bfDs/lib/icons.ts";

export function BfDsIconExample() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSize, setSelectedSize] = useState<BfDsIconSize>(
    "medium",
  );
  const [showGeneratedOnly, setShowGeneratedOnly] = useState(false);
  const [overlayIcon, setOverlayIcon] = useState<BfDsIconName | null>(null);

  // Handle keyboard navigation in overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!overlayIcon) return;

      if (e.key === "Escape") {
        setOverlayIcon(null);
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();

        // Use the same filtering logic as the main component
        const currentFilteredIcons = allIconNames.filter(
          ({ name, aliasOf }) => {
            const matchesSearch = name.toLowerCase().includes(
              searchTerm.toLowerCase(),
            );
            if (showGeneratedOnly) {
              const lookupName = (aliasOf || name) as keyof typeof icons;
              const iconData = icons[lookupName];
              const isGenerated = iconData && "generated" in iconData &&
                iconData.generated;
              return matchesSearch && isGenerated;
            }
            return matchesSearch;
          },
        );

        const currentIndex = currentFilteredIcons.findIndex((icon) =>
          icon.name === overlayIcon
        );
        if (currentIndex === -1) return;

        let nextIndex;
        if (e.key === "ArrowRight") {
          nextIndex = (currentIndex + 1) % currentFilteredIcons.length;
        } else {
          nextIndex = (currentIndex - 1 + currentFilteredIcons.length) %
            currentFilteredIcons.length;
        }

        setOverlayIcon(currentFilteredIcons[nextIndex].name);
      }
    };

    if (overlayIcon) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [overlayIcon, searchTerm, showGeneratedOnly]);

  const iconNames = Object.keys(icons) as Array<keyof typeof icons>;

  // Create a map of original icons to their aliases
  const iconToAliases: Map<BfDsIconName, Array<BfDsIconName>> = new Map();

  iconNames.forEach((iconName) => {
    const iconData = icons[iconName];
    if (iconData && "aliases" in iconData && iconData.aliases) {
      iconToAliases.set(iconName, iconData.aliases as Array<BfDsIconName>);
    }
  });

  // Create a list that includes only original icons (not aliases)
  const allIconNames: Array<
    { name: BfDsIconName; isAlias: boolean; aliasOf?: BfDsIconName }
  > = iconNames.map((name) => ({ name, isAlias: false }));

  const filteredIcons = allIconNames.filter(({ name, aliasOf }) => {
    // Check if name or any of its aliases match search term
    const aliases = iconToAliases.get(name) || [];
    const allNames = [name, ...aliases];
    const matchesSearch = allNames.some((n) =>
      n.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Check if icon is generated (if filtering by generated only)
    if (showGeneratedOnly) {
      const lookupName = (aliasOf || name) as keyof typeof icons;
      const iconData = icons[lookupName];
      const isGenerated = iconData && "generated" in iconData &&
        iconData.generated;
      return matchesSearch && isGenerated;
    }

    return matchesSearch;
  });

  return (
    <div className="bfds-example">
      <h2>BfDsIcon Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";

// Basic usage
<BfDsIcon name="star" />

// All available props
<BfDsIcon
  name="star"                     // BfDsIconName (required)
  size="medium"                   // "small" | "medium" | "large" | number
  color="currentColor"            // string - CSS color value
  className=""                    // string - additional CSS
  style={{}}                      // React.CSSProperties
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Size Comparison</h3>
        <div className="bfds-example__group bfds-example__group--align-end">
          <div className="bfds-example__item">
            <BfDsIcon name="arrowRight" size="small" />
            <div className="bfds-example__label">Small</div>
          </div>
          <div className="bfds-example__item">
            <BfDsIcon name="arrowRight" size="medium" />
            <div className="bfds-example__label">Medium</div>
          </div>
          <div className="bfds-example__item">
            <BfDsIcon name="arrowRight" size="large" />
            <div className="bfds-example__label">Large</div>
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Color Examples</h3>
        <div className="bfds-example__group bfds-example__group--align-center">
          <BfDsIcon name="brand-github" size="large" />
          <BfDsIcon
            name="brand-github"
            size="large"
            color="var(--bfds-primary)"
          />
          <BfDsIcon
            name="brand-github"
            size="large"
            color="var(--bfds-secondary)"
          />
          <BfDsIcon name="brand-github" size="large" color="#ff4444" />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Controls</h3>
        <div className="bfds-example__controls">
          <div className="bfds-example__control">
            <label
              htmlFor="icon-search"
              className="bfds-example__control-label"
            >
              Search Icons:
            </label>
            <input
              id="icon-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="bfds-example__input"
            />
          </div>

          <div className="bfds-example__control">
            <label className="bfds-example__control-label">
              Size:
            </label>
            <div className="bfds-example__group">
              {(["small", "medium", "large"] as const).map((size) => (
                <BfDsButton
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  variant={selectedSize === size ? "primary" : "ghost"}
                >
                  {size}
                </BfDsButton>
              ))}
            </div>
          </div>

          <div className="bfds-example__control">
            <label className="bfds-example__control-label">
              Filter:
            </label>
            <div className="bfds-example__group">
              <BfDsButton
                onClick={() => setShowGeneratedOnly(!showGeneratedOnly)}
                variant={showGeneratedOnly ? "primary" : "ghost"}
                icon="sparkle"
              >
                Generated Only
              </BfDsButton>
            </div>
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>
          {showGeneratedOnly ? "Generated icons" : "All icons"}{" "}
          ({filteredIcons.length} found)
        </h3>
        <div className="bfds-example__grid">
          {filteredIcons.map((iconInfo) => {
            const { name: iconName, aliasOf } = iconInfo;
            const lookupName = (aliasOf || iconName) as keyof typeof icons;
            const iconData = icons[lookupName];
            const isGenerated = !!(iconData && "generated" in iconData &&
              iconData.generated);

            return (
              <div
                key={iconName}
                className="bfds-example__grid-item"
                style={{
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => setOverlayIcon(iconName)}
                title={`Click to view ${iconName} at 500x500px`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--bfds-background-hover)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.transform = "";
                }}
              >
                {isGenerated && (
                  <BfDsBadge
                    variant="info"
                    size="small"
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: "2px",
                      fontSize: "10px",
                      padding: "2px 4px",
                      whiteSpace: "nowrap",
                      zIndex: 1,
                    }}
                  >
                    <BfDsIcon name="sparkle" size="small" />
                  </BfDsBadge>
                )}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BfDsIcon name={iconName} size={selectedSize} />
                </div>
                <div className="bfds-example__grid-item-label">
                  {(() => {
                    const aliases = iconToAliases.get(iconName) || [];
                    if (aliases.length > 0) {
                      return `${iconName}, ${aliases.join(", ")}`;
                    }
                    return iconName;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Icon Overlay */}
      {overlayIcon && (
        <div
          className="bfds-icon-overlay"
          onClick={() => setOverlayIcon(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <div
            className="bfds-icon-overlay-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
              textAlign: "center",
              position: "relative",
            }}
          >
            <BfDsButton
              variant="ghost"
              icon="cross"
              iconOnly
              onClick={() => setOverlayIcon(null)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
              }}
            />
            <div style={{ marginBottom: "1rem" }}>
              <BfDsIcon name={overlayIcon} size={500} />
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--bfds-text)",
                marginTop: "1rem",
              }}
            >
              {overlayIcon}
            </div>
            {(() => {
              // Show aliases if this icon has any
              const aliases = iconToAliases.get(overlayIcon) || [];
              if (aliases.length > 0) {
                return (
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--bfds-text-secondary)",
                      marginTop: "0.25rem",
                      fontStyle: "italic",
                    }}
                  >
                    Also available as: {aliases.join(", ")}
                  </div>
                );
              }
              return null;
            })()}
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--bfds-text-secondary)",
                marginTop: "0.5rem",
              }}
            >
              Use ← → arrow keys to navigate • Click outside or press ESC to
              close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
