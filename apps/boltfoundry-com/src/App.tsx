import {
  AppEnvironmentProvider,
  type ServerProps,
} from "../contexts/AppEnvironmentContext.tsx";
import { AppRoot } from "../AppRoot.tsx";
import { BfDsProvider } from "@bfmono/apps/bfDs/components/BfDsProvider.tsx";

function App(props: Partial<ServerProps>) {
  return (
    <div className="app">
      <BfDsProvider>
        <AppEnvironmentProvider
          IS_SERVER_RENDERING={false}
          {...props}
        >
          <AppRoot />
        </AppEnvironmentProvider>
      </BfDsProvider>
    </div>
  );
}

export default App;
