import { RouterProvider } from "./RouterContext.tsx";

import * as React from "react";
import {
  type IsographEnvironment,
  IsographEnvironmentProvider,
} from "@isograph/react";
import { getEnvironment } from "../isographEnvironment.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

const AppEnvironmentContext = React.createContext<AppEnvironmentProps>({});

export type AppEnvironmentProps = {
  mode?: string;
  port?: number;
  currentPath?: string;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  BF_E2E_MODE?: boolean;
  BF_ENV?: string;
};

export type ServerProps =
  & AppEnvironmentProps
  & {
    initialPath?: string;
    IS_SERVER_RENDERING: boolean;
    isographServerEnvironment?: IsographEnvironment;
  };

export function useAppEnvironment() {
  return React.useContext<AppEnvironmentProps>(AppEnvironmentContext);
}

export function AppEnvironmentProvider(
  {
    children,
    initialPath,
    isographServerEnvironment,
    ...appEnvironment
  }: React.PropsWithChildren<ServerProps>,
) {
  const isographEnvironment = isographServerEnvironment ?? getEnvironment();

  logger.debug("AppEnvironmentProvider: initialPath", initialPath);
  logger.debug(
    "isographEnvironment:",
    isographEnvironment,
    "isServerEnvironment:",
    !!isographServerEnvironment,
  );

  return (
    <AppEnvironmentContext.Provider value={appEnvironment}>
      <IsographEnvironmentProvider environment={isographEnvironment}>
        <RouterProvider
          initialPath={initialPath}
        >
          {children}
        </RouterProvider>
      </IsographEnvironmentProvider>
    </AppEnvironmentContext.Provider>
  );
}
