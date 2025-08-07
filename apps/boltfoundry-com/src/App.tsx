import {
  AppEnvironmentProvider,
  type ServerProps,
} from "../contexts/AppEnvironmentContext.tsx";
import { AppRoot } from "../AppRoot.tsx";
import { BfDsProvider } from "@bfmono/apps/bfDs/components/BfDsProvider.tsx";
import { BfDsHudProvider } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";
import { BfDsHud } from "@bfmono/apps/bfDs/components/BfDsHud.tsx";

function App(props: Partial<ServerProps>) {
  return (
    <div className="app">
      <BfDsProvider>
        <BfDsHudProvider>
          <AppEnvironmentProvider
            IS_SERVER_RENDERING={false}
            {...props}
          >
            <AppRoot />
          </AppEnvironmentProvider>
          <BfDsHud />
        </BfDsHudProvider>
      </BfDsProvider>
    </div>
  );
}

export default App;
