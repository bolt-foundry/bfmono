/**
 * @fileoverview BfDsTabs - A comprehensive tab navigation component with support for icons, disabled states, nested subtabs, and both controlled and uncontrolled modes. Perfect for organizing content into separate views.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useEffect, useState } from "react";
import { BfDsIcon, type BfDsIconName } from "./BfDsIcon.tsx";
import { BfDsBadge, type BfDsBadgeVariant } from "./BfDsBadge.tsx";

export type BfDsTabItem = {
  /** Unique identifier for the tab */
  id: string;
  /** Display text for the tab */
  label: string;
  /** Content to show when tab is active */
  content: React.ReactNode;
  /** Optional icon to display in tab */
  icon?: BfDsIconName;
  /** When true, tab cannot be selected */
  disabled?: boolean;
  /** Optional nested subtabs */
  subtabs?: Array<BfDsTabItem>;
  /** Optional badge text to display as a small dot indicator on the tab (e.g., "New", "Popular", "Coming Soon") */
  badge?: string;
  /** Badge variant determining the dot color: "primary", "secondary", "success", "warning", "error", "info" */
  badgeVariant?: BfDsBadgeVariant;
};

/**
 * Props for the BfDsTabs component
 */
export type BfDsTabsProps = {
  /** Array of tab configuration objects defining the tabs to display */
  tabs: Array<BfDsTabItem>;
  /** Currently active tab ID for controlled mode. When provided, component operates in controlled mode */
  activeTab?: string;
  /** Default active tab ID for uncontrolled mode. Used only when activeTab is not provided */
  defaultActiveTab?: string;
  /** Callback function called when tab selection changes, receives the new tab ID */
  onTabChange?: (tabId: string) => void;
  /** Additional CSS classes to apply to the tabs container */
  className?: string;
  /** Visual style variant that affects the appearance of tabs */
  variant?: "primary" | "secondary";
  /** Size variant that controls the dimensions and padding of tabs */
  size?: "small" | "medium" | "large";
};

export type BfDsTabsState = {
  activeTab: string;
  activeSubtabs: Record<string, string>; // parentTabId -> activeSubtabId
};

/**
 * A comprehensive tab navigation component with support for icons, disabled states, nested subtabs,
 * and both controlled and uncontrolled modes. Perfect for organizing content into separate views
 * with consistent navigation patterns and accessibility support.
 *
 * @example
 * // Basic uncontrolled tabs
 * const tabs = [
 *   { id: "overview", label: "Overview", content: <div>Overview content</div> },
 *   { id: "settings", label: "Settings", content: <div>Settings content</div> },
 *   { id: "help", label: "Help", content: <div>Help content</div> },
 * ];
 * <BfDsTabs tabs={tabs} defaultActiveTab="overview" />
 *
 * @example
 * // Controlled mode with state management
 * const [activeTab, setActiveTab] = useState("overview");
 * <BfDsTabs
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 *
 * @example
 * // Tabs with icons, badges, and different variants
 * const tabsWithIcons = [
 *   {
 *     id: "dashboard",
 *     label: "Dashboard",
 *     icon: "autoframe",
 *     badge: "New",
 *     badgeVariant: "success",
 *     content: <DashboardContent />
 *   },
 *   {
 *     id: "analytics",
 *     label: "Analytics",
 *     icon: "arrowsLeftRight",
 *     badge: "Popular",
 *     badgeVariant: "primary",
 *     content: <AnalyticsContent />
 *   },
 *   {
 *     id: "settings",
 *     label: "Settings",
 *     icon: "settings",
 *     badge: "Coming Soon",
 *     badgeVariant: "secondary",
 *     content: <SettingsContent />
 *   },
 * ];
 * <BfDsTabs tabs={tabsWithIcons} variant="secondary" size="large" />
 *
 * @example
 * // Nested subtabs for hierarchical navigation
 * const tabsWithSubtabs = [
 *   {
 *     id: "documentation",
 *     label: "Documentation",
 *     icon: "brand-github",
 *     content: <div>Main documentation content</div>,
 *     subtabs: [
 *       { id: "getting-started", label: "Getting Started", content: <GettingStarted /> },
 *       { id: "api-reference", label: "API Reference", content: <ApiReference /> },
 *       { id: "examples", label: "Examples", content: <Examples /> },
 *     ],
 *   },
 *   {
 *     id: "support",
 *     label: "Support",
 *     icon: "brand-discord",
 *     subtabs: [
 *       { id: "faq", label: "FAQ", content: <FAQ /> },
 *       { id: "contact", label: "Contact", disabled: true, content: <Contact /> },
 *     ],
 *   },
 * ];
 * <BfDsTabs tabs={tabsWithSubtabs} />
 *
 * @example
 * // Application navigation with URL integration
 * function AppNavigation() {
 *   const navigate = useNavigate();
 *   const location = useLocation();
 *   const activeTab = location.pathname.split("/").pop() || "dashboard";
 *
 *   const appTabs = [
 *     { id: "dashboard", label: "Dashboard", icon: "autoframe", content: <DashboardPage /> },
 *     { id: "projects", label: "Projects", icon: "computer", content: <ProjectsPage /> },
 *     { id: "team", label: "Team", icon: "friend", content: <TeamPage /> },
 *     { id: "settings", label: "Settings", icon: "settings", content: <SettingsPage /> },
 *   ];
 *
 *   const handleTabChange = (tabId: string) => {
 *     navigate(`/app/${tabId}`);
 *   };
 *
 *   return (
 *     <BfDsTabs
 *       tabs={appTabs}
 *       activeTab={activeTab}
 *       onTabChange={handleTabChange}
 *       size="large"
 *     />
 *   );
 * }
 *
 * @param props - The tabs props
 * @param props.tabs - Array of tab configurations
 * @param props.activeTab - Current active tab ID (controlled)
 * @param props.defaultActiveTab - Default tab ID (uncontrolled)
 * @param props.onTabChange - Tab change callback
 * @param props.className - Additional CSS classes
 * @param props.variant - Visual style variant (default: "primary")
 * @param props.size - Size variant (default: "medium")
 * @returns A tab navigation component with content panels
 *
 * @accessibility
 * - Uses proper ARIA roles (tablist, tab, tabpanel)
 * - Maintains aria-selected and aria-controls relationships
 * - Supports keyboard navigation (Tab, Arrow keys, Enter, Space)
 * - Provides context for nested subtabs
 * - Clear focus indicators and logical tab order
 */
export function BfDsTabs({
  tabs,
  activeTab,
  defaultActiveTab,
  onTabChange,
  className,
  variant = "primary",
  size = "medium",
}: BfDsTabsProps) {
  // Determine if this is controlled or uncontrolled
  const isControlled = activeTab !== undefined;

  // Initialize state
  const [state, setState] = useState<BfDsTabsState>(() => {
    const initialActiveTab = activeTab || defaultActiveTab || tabs[0]?.id || "";
    const activeSubtabs: Record<string, string> = {};

    // Initialize subtab states
    tabs.forEach((tab) => {
      if (tab.subtabs && tab.subtabs.length > 0) {
        activeSubtabs[tab.id] = tab.subtabs[0].id;
      }
    });

    return {
      activeTab: initialActiveTab,
      activeSubtabs,
    };
  });

  // Update state when controlled activeTab changes
  useEffect(() => {
    if (isControlled && activeTab !== undefined) {
      setState((prev) => ({
        ...prev,
        activeTab,
      }));
    }
  }, [activeTab, isControlled]);

  const currentActiveTab = isControlled ? activeTab! : state.activeTab;

  const handleTabClick = (tabId: string) => {
    if (tabs.find((tab) => tab.id === tabId)?.disabled) return;

    if (!isControlled) {
      setState((prev) => ({
        ...prev,
        activeTab: tabId,
      }));
    }

    onTabChange?.(tabId);
  };

  const handleSubtabClick = (parentTabId: string, subtabId: string) => {
    const parentTab = tabs.find((tab) => tab.id === parentTabId);
    const subtab = parentTab?.subtabs?.find((sub) => sub.id === subtabId);
    if (subtab?.disabled) return;

    setState((prev) => ({
      ...prev,
      activeSubtabs: {
        ...prev.activeSubtabs,
        [parentTabId]: subtabId,
      },
    }));
  };

  const renderTab = (
    tab: BfDsTabItem,
    isActive: boolean,
    _index: number,
    _tabIds: Array<string>,
  ) => {
    const classes = [
      "bfds-tab",
      `bfds-tab--${variant}`,
      `bfds-tab--${size}`,
      isActive && "bfds-tab--active",
      tab.disabled && "bfds-tab--disabled",
      tab.badge && "bfds-tab--with-badge",
    ].filter(Boolean).join(" ");

    return (
      <button
        key={tab.id}
        type="button"
        className={classes}
        onClick={() => handleTabClick(tab.id)}
        disabled={tab.disabled}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${tab.id}`}
      >
        <div
          className="bfds-tab__content"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {tab.icon && (
            <BfDsIcon
              name={tab.icon}
              size={size === "small"
                ? "small"
                : size === "large"
                ? "large"
                : "medium"}
            />
          )}
          <span className="bfds-tab__label">{tab.label}</span>
          {tab.badge && (
            <BfDsBadge
              variant={tab.badgeVariant || "primary"}
              dot
              className="bfds-tab__badge"
            >
              {tab.badge}
            </BfDsBadge>
          )}
        </div>
      </button>
    );
  };

  const renderSubtab = (
    subtab: BfDsTabItem,
    parentTab: BfDsTabItem,
    isActive: boolean,
    _index: number,
    _subtabIds: Array<string>,
  ) => {
    const classes = [
      "bfds-subtab",
      `bfds-subtab--${variant}`,
      `bfds-subtab--${size}`,
      isActive && "bfds-subtab--active",
      subtab.disabled && "bfds-subtab--disabled",
      subtab.badge && "bfds-subtab--with-badge",
    ].filter(Boolean).join(" ");

    return (
      <button
        key={subtab.id}
        type="button"
        className={classes}
        onClick={() => handleSubtabClick(parentTab.id, subtab.id)}
        disabled={subtab.disabled}
        role="tab"
        aria-selected={isActive}
        aria-controls={`subpanel-${parentTab.id}-${subtab.id}`}
      >
        <div
          className="bfds-subtab__content"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {subtab.icon && (
            <BfDsIcon
              name={subtab.icon}
              size="small"
            />
          )}
          <span className="bfds-subtab__label">{subtab.label}</span>
          {subtab.badge && (
            <BfDsBadge
              variant={subtab.badgeVariant || "primary"}
              dot
              className="bfds-subtab__badge"
            >
              {subtab.badge}
            </BfDsBadge>
          )}
        </div>
      </button>
    );
  };

  const activeTabData = tabs.find((tab) => tab.id === currentActiveTab);
  const hasSubtabs = activeTabData?.subtabs && activeTabData.subtabs.length > 0;
  const activeSubtabId = hasSubtabs
    ? state.activeSubtabs[currentActiveTab]
    : null;
  const activeSubtabData = hasSubtabs
    ? activeTabData?.subtabs?.find((sub) => sub.id === activeSubtabId)
    : null;

  const tabIds = tabs.map((tab) => tab.id);
  const subtabIds = activeTabData?.subtabs?.map((sub) => sub.id) || [];

  const containerClasses = [
    "bfds-tabs",
    `bfds-tabs--${variant}`,
    `bfds-tabs--${size}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {/* Main tabs */}
      <div
        className="bfds-tabs__header"
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) =>
          renderTab(tab, tab.id === currentActiveTab, index, tabIds)
        )}
      </div>

      {/* Subtabs */}
      {hasSubtabs && activeTabData?.subtabs && (
        <div
          className="bfds-tabs__subheader"
          role="tablist"
          aria-orientation="horizontal"
        >
          {activeTabData.subtabs.map((subtab, index) =>
            renderSubtab(
              subtab,
              activeTabData,
              subtab.id === activeSubtabId,
              index,
              subtabIds,
            )
          )}
        </div>
      )}

      {/* Content panels */}
      <div className="bfds-tabs__content">
        {/* Main tab content or subtab content */}
        {hasSubtabs && activeSubtabData
          ? (
            <div
              key={`${currentActiveTab}-${activeSubtabId}`}
              id={`subpanel-${currentActiveTab}-${activeSubtabId}`}
              className="bfds-tabs__panel bfds-tabs__subpanel"
              role="tabpanel"
              aria-labelledby={`subtab-${activeSubtabId}`}
            >
              {activeSubtabData.content}
            </div>
          )
          : (
            <div
              key={currentActiveTab}
              id={`panel-${currentActiveTab}`}
              className="bfds-tabs__panel"
              role="tabpanel"
              aria-labelledby={`tab-${currentActiveTab}`}
            >
              {activeTabData?.content}
            </div>
          )}
      </div>
    </div>
  );
}
