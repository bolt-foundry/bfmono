import * as React from "react";
import { fonts } from "@bfmono/apps/cfDs/const.tsx";
import {
  CfDsIcon,
  type CfDsIconType,
  type IconSizeType,
} from "@bfmono/apps/cfDs/components/CfDsIcon.tsx";
// RouterLink removed - using simple <a> tags instead
import {
  CfDsTooltip,
  type CfDsTooltipJustification,
  type CfDsTooltipPosition,
} from "@bfmono/apps/cfDs/components/CfDsTooltip.tsx";
import { CfDsProgress } from "@bfmono/apps/cfDs/components/CfDsProgress.tsx";
import { CfDsSpinner } from "@bfmono/apps/cfDs/components/CfDsSpinner.tsx";
import {
  CfDsTooltipMenu,
  type CfDsTooltipMenuType,
} from "@bfmono/apps/cfDs/components/CfDsTooltipMenu.tsx";

// Types
export type ButtonSizeType = "xlarge" | "large" | "medium" | "small";

export type ButtonKind =
  | "accent"
  | "alert"
  | "custom"
  | "filled"
  | "filledAccent"
  | "filledAlert"
  | "filledPrimaryLight"
  | "filledSecondary"
  | "filledSuccess"
  | "gradientOverlay"
  | "outline"
  | "outlineAccent"
  | "outlineAlert"
  | "outlineDark"
  | "outlinePrimary"
  | "outlineSuccess"
  | "overlay"
  | "overlayAlert"
  | "overlayDark"
  | "overlaySuccess"
  | "primary"
  | "secondary"
  | "success"
  | "input"
  | "dan"
  | "danDim"
  | "danSelected";

type ButtonCustomSettings = {
  color?: string;
  colorHover?: string;
  backgroundColor?: string;
  backgroundColorHover?: string;
  borderColor?: string;
  borderColorHover?: string;
} | undefined;

export type ButtonXStyle = {
  borderRadius?: "0" | "6px 0 0 6px" | "0 6px 6px 0";
  flex?: string;
  marginInlineEnd?: number;
  marginInlineStart?: number;
  minWidth?: string | number;
  width?: string | number;
  alignSelf?: "flex-start" | "flex-end";
} | undefined;

export type ButtonType = {
  xstyle?: ButtonXStyle;
  iconLeft?: CfDsIconType;
  iconRight?: CfDsIconType;
  // if link is provided, the button will be rendered as a Link
  link?: string;
  // if href is provided, the button will be rendered as an anchor tag
  href?: string;
  hrefTarget?: string;
  onClick?: (e: React.FormEvent) => void;
  progress?: number;
  shadow?: boolean;
  // use showSpinner to show a spinner with an icon button
  // doesn't work with overlayDark, overlay, outlineDark, or outline
  showSpinner?: boolean;
  size?: ButtonSizeType;
  subtext?: string;
  testId?: string; // used to identify the button in posthog
  text?: string | null;
  textIconLeft?: string | null;
  tooltip?: string | React.ReactNode;
  tooltipMenu?: Array<CfDsTooltipMenuType>;
  tooltipMenuDropdown?: Array<CfDsTooltipMenuType>;
  tooltipPosition?: CfDsTooltipPosition;
  tooltipJustification?: CfDsTooltipJustification;
  kind?: ButtonKind;
  customSettings?: ButtonCustomSettings;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const baseStyles: Record<string, React.CSSProperties> = {
  textStyle: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: "0.9em",
  },
  iconStyle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  iconSpinner: {
    position: "absolute",
    top: -1,
    left: -1,
  },
  disabledStyle: {
    opacity: 0.3,
    cursor: "not-allowed",
  },
  dropdownArrow: {
    marginRight: -6,
    marginLeft: 6,
  },
  dropdownArrowIconButton: {
    position: "absolute",
    bottom: 0,
    right: -4,
    height: 15,
    width: 15,
    paddingTop: 2,
    borderRadius: "50%",
    boxSizing: "border-box",
  },
  shadow: {
    boxShadow: "0 5px 10px rgba(0,0,0,.15)",
  },
};

// Size configurations
const buttonSizes = {
  xlarge: { fontSize: 16, minHeight: 38, padding: "14px 30px" },
  large: { fontSize: 14, minHeight: 32, padding: "0px 14px" },
  medium: { fontSize: 12, minHeight: 26, padding: "0px 8px" },
  small: { fontSize: 10, minHeight: 20, padding: "0px 6px" },
};

const iconButtonSizes = {
  xlarge: { width: 64, height: 64 },
  large: { width: 40, height: 40 },
  medium: { width: 32, height: 32, padding: "0 2px" },
  small: { width: 22, height: 22, padding: "0 2px" },
};

const iconSizes: Record<string, 10 | 12 | 16 | 24> = {
  xlarge: 24,
  large: 16,
  medium: 16,
  small: 12,
};

// Base style creators
const createBaseButtonStyle = (
  size: ButtonSizeType,
  hover: boolean,
  xstyle?: React.CSSProperties,
): React.CSSProperties => ({
  display: "inline-flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  flex: "none",
  gap: 6,
  color: "var(--textOnPrimary)",
  backgroundColor: hover ? "var(--primaryButtonHover)" : "var(--primaryButton)",
  borderRadius: 6,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: hover ? "var(--primaryButtonHover)" : "var(--primaryButton)",
  fontWeight: "bold",
  fontFamily: fonts.fontFamily,
  cursor: "pointer",
  textAlign: "center",
  textDecoration: "none",
  position: "relative",
  ...buttonSizes[size],
  ...xstyle,
});

const createBaseIconButtonStyle = (
  size: ButtonSizeType,
  hover: boolean,
  xstyle?: React.CSSProperties,
): React.CSSProperties => ({
  backgroundColor: hover
    ? "var(--backgroundIconHover)"
    : "var(--backgroundIcon)",
  borderRadius: "50%",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: hover ? "var(--backgroundIconHover)" : "var(--backgroundIcon)",
  color: "var(--primaryButton)",
  cursor: "pointer",
  textAlign: "center",
  position: "relative",
  ...iconButtonSizes[size],
  ...xstyle,
});

type ButtonStyle = {
  kind: ButtonKind;
  size: ButtonSizeType;
  hover: boolean;
  isIconButton: boolean;
  xstyle?: React.CSSProperties;
  customSettings?: ButtonCustomSettings;
};

// Button style generator function
const getButtonStyle = (
  {
    kind,
    size,
    hover,
    isIconButton,
    xstyle,
    customSettings,
  }: ButtonStyle,
): React.CSSProperties => {
  // Base style creator based on button type
  const baseStyleCreator = isIconButton
    ? createBaseIconButtonStyle
    : createBaseButtonStyle;
  const baseStyle = baseStyleCreator(size, hover, xstyle);

  // Apply kind-specific style modifications
  switch (kind) {
    case "secondary":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: "var(--textOnSecondary)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--secondaryButtonHover)"
          : "var(--secondaryButton)",
        color: "var(--textOnSecondary)",
        borderColor: hover
          ? "var(--secondaryButtonHover)"
          : "var(--secondaryButton)",
      };
    case "alert":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: hover ? "var(--alertHover)" : "var(--alert)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--alertHover)" : "var(--alert)",
        color: "var(--textOnAlert)",
        borderColor: hover ? "var(--alertHover)" : "var(--alert)",
      };
    case "success":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: hover ? "var(--successHover)" : "var(--success)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--successHover)" : "var(--success)",
        color: "var(--textOnSuccess)",
        borderColor: hover ? "var(--successHover)" : "var(--success)",
      };
    case "filled":
      if (isIconButton) {
        return {
          ...baseStyle,
          backgroundColor: hover
            ? "var(--primaryButtonHover)"
            : "var(--primaryButton)",
          borderColor: hover
            ? "var(--primaryButtonHover)"
            : "var(--primaryButton)",
          color: "var(--textOnPrimary)",
        };
      }
      return {
        ...baseStyle,
      };
    case "filledPrimaryLight":
      if (isIconButton) {
        return {
          ...baseStyle,
          backgroundColor: hover
            ? "var(--primaryButtonHover)"
            : "var(--primaryButton)",
          borderColor: hover
            ? "var(--primaryButtonHover)"
            : "var(--primaryButton)",
          color: "var(--textOnSuccess)",
        };
      }
      return {
        ...baseStyle,
      };
    case "filledSecondary":
      return {
        ...baseStyle,
        color: "var(--textOnSuccess)",
        backgroundColor: hover
          ? "var(--secondaryButtonBackgroundHover)"
          : "var(--secondaryButtonBackground)",
        borderColor: hover
          ? "var(--secondaryButtonBackgroundHover)"
          : "var(--secondaryButtonBackground)",
      };
    case "filledAccent":
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--fourtharyColorHover)"
          : "var(--fourtharyColor)",
        borderColor: hover
          ? "var(--fourtharyColorHover)"
          : "var(--fourtharyColor)",
        color: "var(--textOnAccent)",
      };
    case "filledAlert":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--alertHover)" : "var(--alert)",
        borderColor: hover ? "var(--alertHover)" : "var(--alert)",
        color: "var(--textOnAlert)",
      };
    case "filledSuccess":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--successHover)" : "var(--success)",
        borderColor: hover ? "var(--successHover)" : "var(--success)",
        color: "var(--textOnSuccess)",
      };
    case "outline":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "var(--background)",
        color: "var(--text)",
        borderColor: hover
          ? "var(--secondaryButton)"
          : "var(--secondaryButtonHover)",
      };
    case "outlinePrimary":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "var(--background)",
        color: hover ? "var(--primaryButtonHover)" : "var(--primaryButton)",
        borderColor: hover ? "var(--primaryButtonHover)" : "var(--background)",
      };
    case "outlineDark":
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--outlineDarkHover)"
          : "var(--outlineDark)",
        color: "var(--background)",
        borderColor: hover ? "var(--outlineDarkHover)" : "var(--outlineDark)",
      };
    case "outlineAccent":
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--fourtharyColor015)"
          : "var(--background)",
        color: hover ? "var(--fourtharyColorHover)" : "var(--fourtharyColor)",
        borderColor: hover
          ? "var(--fourtharyColorHover)"
          : "var(--fourtharyColor015)",
      };
    case "outlineAlert":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--alert015)" : "var(--background)",
        color: hover ? "var(--alertHover)" : "var(--alert)",
        borderColor: hover ? "var(--alertHover)" : "var(--alert015)",
      };
    case "outlineSuccess":
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--secondaryColor015)"
          : "var(--background)",
        color: hover ? "var(--successHover)" : "var(--success)",
        borderColor: hover ? "var(--successHover)" : "var(--secondaryColor015)",
      };
    case "overlay":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "transparent",
        color: "var(--text)",
        borderColor: hover ? "var(--outlineHover)" : "transparent",
      };
    case "overlayDark":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineDarkHover)" : "transparent",
        color: "var(--background)",
        borderColor: hover ? "var(--outlineDarkHover)" : "transparent",
      };
    case "overlayAlert":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "transparent",
        color: "var(--alert)",
        borderColor: hover ? "var(--outlineHover)" : "transparent",
      };
    case "overlaySuccess":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "transparent",
        color: "var(--success)",
        borderColor: hover ? "var(--outlineHover)" : "transparent",
      };
    case "accent":
      if (isIconButton) {
        return {
          ...baseStyle,
          color: hover ? "var(--accentButtonHover)" : "var(--accentButton)",
        };
      }
      return {
        ...baseStyle,
        backgroundColor: hover
          ? "var(--accentButtonHover)"
          : "var(--accentButton)",
        color: "var(--textOnAccent)",
        borderColor: hover ? "var(--accentButtonHover)" : "var(--accentButton)",
      };
    case "gradientOverlay":
      if (isIconButton) {
        return {
          ...baseStyle,
          background: hover ? "var(--marketingGradient)" : "transparent",
          color: hover ? "var(--text)" : "var(--textSecondary)",
        };
      }
      return baseStyle;
    case "custom":
      if (!customSettings) {
        return baseStyle;
      }
      return {
        ...baseStyle,
        backgroundColor: customSettings.backgroundColor
          ? hover
            ? customSettings.backgroundColorHover ??
              customSettings.backgroundColor
            : customSettings.backgroundColor
          : baseStyle.backgroundColor,
        color: customSettings.color
          ? hover
            ? customSettings.colorHover ?? customSettings.color
            : customSettings.color
          : baseStyle.color,
        borderColor: customSettings.borderColor
          ? hover
            ? customSettings.borderColorHover ?? customSettings.borderColor
            : customSettings.borderColor
          : baseStyle.color,
      };
    case "input":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--outlineHover)" : "var(--background)",
        color: "var(--text)",
        borderColor: hover ? "var(--textSecondary)" : "var(--textSecondary)",
        textAlign: "left",
        fontWeight: 400,
        fontSize: 16,
      };
    case "dan":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--pageBackground)" : "transparent",
        color: hover ? "var(--primaryColor)" : "var(--text)",
        borderColor: hover ? "var(--primaryColor060)" : "transparent",
      };
    case "danDim":
      return {
        ...baseStyle,
        backgroundColor: hover ? "var(--pageBackground)" : "transparent",
        color: hover ? "var(--primaryColor)" : "var(--text060)",
        borderColor: hover ? "var(--primaryColor060)" : "transparent",
      };
    case "danSelected":
      return {
        ...baseStyle,
        backgroundColor: "var(--primaryColor030)",
        color: "var(--primaryColor)",
        borderColor: "transparent",
      };
    default:
      return baseStyle;
  }
};

// Component definitions
const ButtonSpinner = ({
  kind,
  size,
  progress,
  isIconButton,
  customSettings,
}: {
  kind: ButtonKind;
  size: ButtonSizeType;
  progress?: number;
  isIconButton: boolean;
  customSettings: ButtonCustomSettings;
}) => {
  if (isIconButton) {
    const iconSize = iconButtonSizes[size].width;
    const backgroundColor = (hover: boolean) =>
      getButtonStyle({ kind, size, hover, isIconButton: true, customSettings })
        .backgroundColor as string;
    const spinnerColor = (hover: boolean) =>
      getButtonStyle({ kind, size, hover, isIconButton: true, customSettings })
        .color as string;

    return (
      <div style={baseStyles.iconSpinner}>
        {progress != null && progress > 0
          ? (
            <CfDsProgress
              size={iconSize}
              progress={progress}
              backgroundColor={backgroundColor(false)}
              spinnerColor={spinnerColor(false)}
            />
          )
          : (
            <CfDsSpinner
              size={iconSize}
              backgroundColor={backgroundColor(false)}
              spinnerColor={spinnerColor(false)}
            />
          )}
      </div>
    );
  }

  const buttonBg = (hover: boolean) =>
    getButtonStyle({ kind, size, hover, isIconButton: false, customSettings })
      .backgroundColor as string;
  const buttonColor = (hover: boolean) =>
    getButtonStyle({ kind, size, hover, isIconButton: false, customSettings })
      .color as string;

  return (
    <div style={baseStyles.iconStyle}>
      {progress != null && progress > 0
        ? (
          <CfDsProgress
            size={iconSizes[size]}
            progress={progress}
            backgroundColor={buttonBg(false)}
            spinnerColor={buttonColor(false)}
          />
        )
        : (
          <CfDsSpinner
            size={iconSizes[size]}
            backgroundColor={buttonBg(false)}
            spinnerColor={buttonColor(false)}
          />
        )}
    </div>
  );
};

const ButtonIcon = ({
  name,
  color,
  size,
  progress,
}: {
  name: CfDsIconType;
  color: string;
  size: number;
  progress?: number;
}) => {
  if (progress && progress > 0) {
    return (
      <div className="mono" style={{ fontSize: 12 }}>
        {Math.round(progress)}%
      </div>
    );
  }

  return <CfDsIcon name={name} color={color} size={size as IconSizeType} />;
};

const DropdownArrow = ({
  isIconButton,
  kind,
  hover,
  size,
  iconColor,
  customSettings,
}: {
  isIconButton: boolean;
  kind: ButtonKind;
  hover: boolean;
  size: ButtonSizeType;
  iconColor: string;
  customSettings: ButtonCustomSettings;
}) => {
  const style = isIconButton
    ? {
      ...baseStyles.dropdownArrowIconButton,
      backgroundColor: getButtonStyle(
        { kind, size, hover, isIconButton, customSettings },
      )
        .borderColor as string,
    }
    : baseStyles.dropdownArrow;

  return (
    <div style={style}>
      <CfDsIcon name="triangleDown" color={iconColor} size={10} />
    </div>
  );
};

// Main Button Component
export function CfDsButton({
  xstyle,
  disabled = false,
  iconLeft,
  iconRight,
  link,
  href,
  hrefTarget,
  onClick,
  progress,
  shadow = false,
  showSpinner = false,
  size = "large",
  subtext,
  testId,
  text,
  textIconLeft,
  tooltip,
  tooltipMenu,
  tooltipMenuDropdown,
  tooltipPosition = "top",
  tooltipJustification = "center",
  kind = "primary",
  type = "button",
  customSettings,
  role: passedRole,
  ...props
}: ButtonType) {
  const [hover, setHover] = React.useState(false);
  const role = passedRole ?? text;
  const isIconButton = !text && !subtext;

  // Get the appropriate color for icons based on button style
  const buttonStyle = getButtonStyle(
    { kind, size, hover, isIconButton, xstyle, customSettings },
  );
  const iconColor = buttonStyle.color as string;

  // Determine if spinner should be shown
  const shouldShowSpinner = (showSpinner || progress != null) &&
    kind !== "overlay" &&
    kind !== "outlineDark" &&
    kind !== "outline";

  // Event handlers
  const handleMouseOver = () => !disabled && setHover(true);
  const handleMouseOut = () => !disabled && setHover(false);
  const handleClick = (e: React.FormEvent) => {
    if (disabled || link != null || href != null) return;
    onClick?.(e);
  };

  // Render button content
  const renderButtonContent = () => (
    <>
      {shouldShowSpinner && isIconButton && (
        <ButtonSpinner
          kind={kind}
          size={size}
          progress={progress}
          isIconButton
          customSettings={customSettings}
        />
      )}

      {shouldShowSpinner && !isIconButton
        ? (
          <ButtonSpinner
            kind={kind}
            size={size}
            progress={progress}
            isIconButton={false}
            customSettings={customSettings}
          />
        )
        : (
          <>
            {iconLeft && (
              <div className="cfds-button-icon" style={baseStyles.iconStyle}>
                <ButtonIcon
                  name={iconLeft as CfDsIconType}
                  color={iconColor}
                  size={iconSizes[size]}
                  progress={progress}
                />
              </div>
            )}
            {textIconLeft && (
              <div
                className="textIcon"
                style={{
                  color: iconColor,
                  fontSize: iconSizes[size] + 6,
                }}
              >
                {textIconLeft}
              </div>
            )}
          </>
        )}

      {!isIconButton && (
        <div className="cfds-button-text" style={baseStyles.textStyle}>
          <div>{text}</div>
          {subtext && <div style={{ fontSize: "0.7em" }}>{subtext}</div>}
        </div>
      )}

      {iconRight && (
        <div className="cfds-button-icon-right" style={baseStyles.iconStyle}>
          <CfDsIcon name={iconRight} color={iconColor} size={iconSizes[size]} />
        </div>
      )}

      {tooltipMenuDropdown && (
        <DropdownArrow
          isIconButton={isIconButton}
          kind={kind}
          hover={hover}
          size={size}
          iconColor={iconColor}
          customSettings={customSettings}
        />
      )}
    </>
  );

  // Create button element
  const buttonElement = (
    <button
      {...props}
      disabled={disabled}
      type={type}
      style={{
        ...buttonStyle,
        ...(disabled ? baseStyles.disabledStyle : {}),
        ...(shadow ? baseStyles.shadow : {}),
      }}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      data-bf-icon={iconLeft}
      data-bf-testid={testId}
      role={role ?? text ?? "button"}
    >
      {renderButtonContent()}
    </button>
  );

  // Wrap with link if needed
  let wrappedButton = buttonElement;
  if (link) {
    wrappedButton = (
      <a href={link} style={{ display: "block" }} target={hrefTarget}>
        {buttonElement}
      </a>
    );
  } else if (href) {
    wrappedButton = (
      <a href={href} target={hrefTarget}>
        {buttonElement}
      </a>
    );
  }

  // Wrap with tooltip if needed
  if (tooltip) {
    wrappedButton = (
      <CfDsTooltip
        justification={tooltipJustification}
        position={tooltipPosition}
        text={tooltip}
        xstyle={xstyle}
      >
        {wrappedButton}
      </CfDsTooltip>
    );
  }

  if (tooltipMenu || tooltipMenuDropdown) {
    wrappedButton = (
      <CfDsTooltipMenu
        menu={tooltipMenu ?? tooltipMenuDropdown ?? []}
        justification={tooltipJustification}
        position={tooltipPosition}
        xstyle={xstyle}
      >
        {wrappedButton}
      </CfDsTooltipMenu>
    );
  }

  return wrappedButton;
}
