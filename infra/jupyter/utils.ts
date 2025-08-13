/// <reference lib="deno.unstable" />
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import * as OriginalReact from "react";
import * as ReactDOMServer from "react-dom/server";
import { BaseComponent } from "@bfmono/infra/jupyter/BaseComponent.tsx";
// import { build } from "@bfmono/infra/appBuild/appBuild.ts"; // appBuild removed

const logger = getLogger(import.meta);

export async function importReactComponentForJupyter(filePath: string) {
  const module = await import(filePath);
  const returnableModule = {};
  Object.entries(module).forEach(([name, module]) => {
    // @ts-expect-error #techdebt
    module.originalPath = filePath;
    // @ts-expect-error #techdebt
    returnableModule[name] = module;
  });
  return returnableModule;
}

// @ts-expect-error #techdebt
function createElement(type, props, ...children) {
  const originalElement = OriginalReact.createElement(type, props, ...children);

  const hackedElement = {
    ...originalElement,
    [Deno.jupyter.$display]: async () => {
      const slimBuildLogger = getLogger("infra/build/slimBuild.ts");
      slimBuildLogger.setLevel(logger.levels.WARN);

      try {
        const hydrateModuleText = await Deno.readTextFile(
          new URL("./rehydrate.ts", import.meta.url),
        );

        const hydrateModuleTextPrependedWithOtherModule =
          `import { ${type.name} as MainComponent } from "${type.originalPath}";\n${hydrateModuleText}`;

        const tempFolder = import.meta.resolve("static/build/jupyter").replace(
          "file://",
          "",
        );
        await Deno.mkdir(tempFolder, { recursive: true });
        const tempFile = `${tempFolder}/tmp.tsx`;
        await Deno.writeTextFile(
          tempFile,
          hydrateModuleTextPrependedWithOtherModule,
        );

        // Build removed - appBuild deleted, jupyter deprecated
        const sourceModuleText = "// Build functionality removed";

        const baseElement = OriginalReact.createElement(
          BaseComponent,
          { environment: props, sourceModuleText },
          originalElement,
        );

        const html = ReactDOMServer.renderToStaticMarkup(baseElement);
        const iframeHtml = `<iframe srcdoc="${
          html.replaceAll(/"/g, "&#34;")
        }" style="border: none; width: 100%; height: 500px;"></iframe>`;

        return {
          "text/html": iframeHtml,
          "text/plain": "Jupyter React Component",
        };
      } catch (error) {
        logger.error("Error in Jupyter display:", error);
        return {
          "text/plain": `Error: ${(error as Error).message}`,
        };
      }
    },
  };
  return hackedElement;
}

const React = { ...OriginalReact, createElement };

export { React };
