import {
  AppEnvironmentProvider,
  type ServerProps,
} from "../contexts/AppEnvironmentContext.tsx";
import { AppRoot } from "../AppRoot.tsx";
import { BfDsProvider } from "@bfmono/apps/bfDs/components/BfDsProvider.tsx";
import { HudProvider } from "../contexts/HudContext.tsx";
import { Hud } from "../components/Hud/Hud.tsx";

function App(props: Partial<ServerProps>) {
  return (
    <div className="app">
      <BfDsProvider>
        <HudProvider>
          <AppEnvironmentProvider
            IS_SERVER_RENDERING={false}
            {...props}
          >
            <AppRoot />
          </AppEnvironmentProvider>
          <Hud />
        </HudProvider>
      </BfDsProvider>
    </div>
  );
}

export default App;
