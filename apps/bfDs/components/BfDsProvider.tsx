/**
 * @fileoverview BfDsProvider - Root provider component that enables all BfDs global functionality
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { BfDsToastProvider } from "../contexts/BfDsToastContext.tsx";
import { BfDsHudProvider } from "../contexts/BfDsHudContext.tsx";
import { BfDsHud } from "./BfDsHud.tsx";

/**
 * The root provider component that enables all BfDs global functionality including
 * toast notifications and HUD development tools.
 *
 * BfDsProvider wraps your entire application to provide comprehensive BfDs functionality
 * to the entire component tree. It automatically includes toast notifications via
 * BfDsToastProvider, development HUD tools via BfDsHudProvider + BfDsHud, and is
 * ready for additional system-wide functionality.
 *
 * ## Features Provided:
 * - **Toast notifications** - Global toast context for showing success, error, and info messages
 * - **HUD development tools** - Development HUD with debugging capabilities and custom buttons
 * - **Future global features** - Architecture ready for additional system-wide functionality
 *
 * ## Architecture:
 * The provider wraps multiple context providers in optimal order:
 * BfDsToastProvider → BfDsHudProvider → children + BfDsHud component
 *
 * ## Performance:
 * - Minimal overhead with lightweight context providers
 * - Toast rendering is optimized
 * - HUD is rendered but hidden by default (safe for production)
 * - No unnecessary re-renders
 *
 * @param {React.PropsWithChildren} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to BfDs functionality
 *
 * @example
 * // Basic application setup - wrap your entire app
 * import { BfDsProvider } from "@bfmono/bfDs";
 *
 * function App() {
 *   return (
 *     <BfDsProvider>
 *       // Your entire app goes here
 *       <MainContent />
 *     </BfDsProvider>
 *   );
 * }
 *
 * @example
 * // Using toast functionality after wrapping with BfDsProvider
 * import { useBfDsToast } from "@bfmono/bfDs";
 *
 * function MyComponent() {
 *   const { showToast } = useBfDsToast();
 *
 *   const handleSuccess = () => {
 *     showToast("Operation completed successfully!", { variant: "success" });
 *   };
 *
 *   return <button onClick={handleSuccess}>Save</button>;
 * }
 *
 * @example
 * // Using HUD development tools after wrapping with BfDsProvider
 * import { useHud } from "@bfmono/bfDs";
 *
 * function DevComponent() {
 *   const { addButton, sendMessage, showHud } = useHud();
 *
 *   useEffect(() => {
 *     addButton({
 *       id: "debug-toggle",
 *       label: "Debug Mode",
 *       onClick: () => sendMessage("Debug mode toggled"),
 *       toggleable: true,
 *     });
 *   }, [addButton, sendMessage]);
 *
 *   return <button onClick={showHud}>Show Debug HUD</button>;
 * }
 *
 * @example
 * // Testing setup - always wrap components that use BfDs hooks
 * import { render } from "@testing-library/react";
 * import { BfDsProvider } from "@bfmono/bfDs";
 * import { MyComponent } from "./MyComponent";
 *
 * test("component works with BfDs context", () => {
 *   render(
 *     <BfDsProvider>
 *       <MyComponent />
 *     </BfDsProvider>,
 *   );
 *   // Test your component
 * });
 *
 * @example
 * // Integration with other providers - BfDsProvider should be outermost
 * function App() {
 *   return (
 *     <BfDsProvider>
 *       <RouterProvider>
 *         <AuthProvider>
 *           <UserProvider>
 *             <MainApp />
 *           </UserProvider>
 *         </AuthProvider>
 *       </RouterProvider>
 *     </BfDsProvider>
 *   );
 * }
 *
 * @example
 * // Multiple sub-applications setup
 * function MultiAppRoot() {
 *   return (
 *     <BfDsProvider>
 *       <AppA />
 *       <AppB />
 *       <SharedComponents />
 *     </BfDsProvider>
 *   );
 * }
 *
 * @throws {Error} Components using BfDs hooks (useBfDsToast, useHud) will throw helpful errors if used outside BfDsProvider
 *
 * @see {@link BfDsHud} - The development HUD component (automatically included)
 * @see {@link BfDsToast} - Toast notification components (automatically enabled)
 * @see {@link useBfDsToast} - Hook for showing toast notifications
 * @see {@link useHud} - Hook for interacting with the development HUD
 *
 * @since 2.0.0
 */
export function BfDsProvider({ children }: React.PropsWithChildren) {
  return (
    <BfDsToastProvider>
      <BfDsHudProvider>
        {children}
        <BfDsHud />
      </BfDsHudProvider>
    </BfDsToastProvider>
  );
}
