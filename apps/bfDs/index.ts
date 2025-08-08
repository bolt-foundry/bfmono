/**
 * @fileoverview Bolt Foundry Design System (BfDs) - Complete component library and design system
 *
 * This is the main entry point for the Bolt Foundry Design System, providing a comprehensive
 * collection of React components, contexts, hooks, and utilities for building consistent
 * user interfaces. The design system includes form controls, layout components, navigation
 * elements, feedback components, and development tools.
 *
 * @author Justin Carter <justin@boltfoundry.com>
 * @version 2.0.0
 * @since 2.0.0
 *
 * @example
 * // Import individual components
 * import { BfDsButton, BfDsInput, BfDsCard } from "@bfmono/bfDs";
 *
 * @example
 * // Import with provider for global functionality
 * import { BfDsProvider, BfDsButton, useBfDsToast } from "@bfmono/bfDs";
 *
 * function App() {
 *   return (
 *     <BfDsProvider>
 *       <MyApplication />
 *     </BfDsProvider>
 *   );
 * }
 *
 * @example
 * // Import types for TypeScript
 * import type { BfDsButtonProps, BfDsInputState } from "@bfmono/bfDs";
 *
 * @see {@link BfDsProvider} - Root provider for global functionality
 * @see {@link useBfDsToast} - Hook for toast notifications
 * @see {@link useHud} - Hook for development tools
 */

export { BfDsButton } from "./components/BfDsButton.tsx";
export type {
  BfDsButtonProps,
  BfDsButtonSize,
  BfDsButtonVariant,
} from "./components/BfDsButton.tsx";

export { BfDsCopyButton } from "./components/BfDsCopyButton.tsx";
export type { BfDsCopyButtonProps } from "./components/BfDsCopyButton.tsx";

export { BfDsCallout } from "./components/BfDsCallout.tsx";
export type {
  BfDsCalloutProps,
  BfDsCalloutVariant,
} from "./components/BfDsCallout.tsx";

export { BfDsIcon } from "./components/BfDsIcon.tsx";
export type {
  BfDsIconName,
  BfDsIconProps,
  BfDsIconSize,
} from "./components/BfDsIcon.tsx";

export { BfDsTabs } from "./components/BfDsTabs.tsx";
export type {
  BfDsTabItem,
  BfDsTabsProps,
  BfDsTabsState,
} from "./components/BfDsTabs.tsx";

export { BfDsForm } from "./components/BfDsForm.tsx";
export type {
  BfDsFormElementProps,
  BfDsFormValue,
} from "./components/BfDsForm.tsx";

export { BfDsInput } from "./components/BfDsInput.tsx";
export type {
  BfDsInputProps,
  BfDsInputState,
} from "./components/BfDsInput.tsx";

export { BfDsTextArea } from "./components/BfDsTextArea.tsx";
export type {
  BfDsTextAreaProps,
  BfDsTextAreaState,
} from "./components/BfDsTextArea.tsx";

export { BfDsFormSubmitButton } from "./components/BfDsFormSubmitButton.tsx";
export type {
  BfDsFormSubmitButtonProps,
} from "./components/BfDsFormSubmitButton.tsx";

export { useBfDsFormContext } from "./components/BfDsForm.tsx";

export { BfDsList } from "./components/BfDsList.tsx";

export { BfDsListItem } from "./components/BfDsListItem.tsx";
export type { BfDsListItemProps } from "./components/BfDsListItem.tsx";

export { BfDsListBar } from "./components/BfDsListBar.tsx";
export type { BfDsListBarProps } from "./components/BfDsListBar.tsx";

export { BfDsSelect } from "./components/BfDsSelect.tsx";
export type {
  BfDsSelectOption,
  BfDsSelectProps,
} from "./components/BfDsSelect.tsx";

export { BfDsCheckbox } from "./components/BfDsCheckbox.tsx";
export type { BfDsCheckboxProps } from "./components/BfDsCheckbox.tsx";

export { BfDsRadio } from "./components/BfDsRadio.tsx";
export type {
  BfDsRadioOption,
  BfDsRadioProps,
  BfDsRadioSize,
} from "./components/BfDsRadio.tsx";

export { BfDsToggle } from "./components/BfDsToggle.tsx";
export type {
  BfDsToggleProps,
  BfDsToggleSize,
} from "./components/BfDsToggle.tsx";

export { BfDsToastContainer } from "./components/BfDsToast.tsx";
export type { BfDsToastItem } from "./components/BfDsToast.tsx";

export {
  BfDsToastProvider,
  useBfDsToast,
} from "./contexts/BfDsToastContext.tsx";

export { BfDsPill } from "./components/BfDsPill.tsx";
export type { BfDsPillProps, BfDsPillVariant } from "./components/BfDsPill.tsx";

export { BfDsFullPageSpinner, BfDsSpinner } from "./components/BfDsSpinner.tsx";
export type {
  BfDsFullPageSpinnerProps,
  BfDsSpinnerProps,
} from "./components/BfDsSpinner.tsx";

export { BfDsProvider } from "./components/BfDsProvider.tsx";

export { BfDsRange } from "./components/BfDsRange.tsx";
export type {
  BfDsRangeProps,
  BfDsRangeSize,
  BfDsRangeState,
} from "./components/BfDsRange.tsx";

export { BfDsModal } from "./components/BfDsModal.tsx";
export type { BfDsModalProps } from "./components/BfDsModal.tsx";

export { BfDsEmptyState } from "./components/BfDsEmptyState.tsx";
export type { BfDsEmptyStateProps } from "./components/BfDsEmptyState.tsx";

export { BfDsCard } from "./components/BfDsCard.tsx";
export type { BfDsCardProps } from "./components/BfDsCard.tsx";

export { BfDsBadge } from "./components/BfDsBadge.tsx";
export type {
  BfDsBadgeProps,
  BfDsBadgeSize,
  BfDsBadgeVariant,
} from "./components/BfDsBadge.tsx";

export { BfDsHud } from "./components/BfDsHud.tsx";
export {
  type BfDsHudButton,
  type BfDsHudMessage,
  BfDsHudProvider,
  useHud,
} from "./contexts/BfDsHudContext.tsx";
