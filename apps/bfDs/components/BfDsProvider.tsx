import type * as React from "react";
import { BfDsToastProvider } from "../contexts/BfDsToastContext.tsx";
import { BfDsHudProvider } from "../contexts/BfDsHudContext.tsx";
import { BfDsHud } from "./BfDsHud.tsx";

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
