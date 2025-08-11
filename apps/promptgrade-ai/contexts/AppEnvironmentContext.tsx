import { createContext, type ReactNode, useContext } from "react";

export interface ServerProps {
  currentPath: string;
  port: number;
  BF_ENV?: string;
}

interface AppEnvironmentProviderProps extends Partial<ServerProps> {
  children: ReactNode;
  IS_SERVER_RENDERING: boolean;
}

const AppEnvironmentContext = createContext<
  Partial<ServerProps> & { IS_SERVER_RENDERING: boolean }
>({
  IS_SERVER_RENDERING: false,
});

export function AppEnvironmentProvider({
  children,
  ...props
}: AppEnvironmentProviderProps) {
  return (
    <AppEnvironmentContext.Provider value={props}>
      {children}
    </AppEnvironmentContext.Provider>
  );
}

export function useAppEnvironment() {
  return useContext(AppEnvironmentContext);
}
