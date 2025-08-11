import type React from "react";

type Props = React.PropsWithChildren<{
  environment: Record<string, unknown>;
  assetPaths: {
    cssPath?: string;
    jsPath: string;
  };
}>;

/*
 * This only runs on the server!!!! It should never run on the client.
 */
export function ServerRenderedPage(
  { children, environment, assetPaths }: Props,
) {
  // Make environment available during SSR
  // @ts-expect-error - Setting up global for SSR
  globalThis.__ENVIRONMENT__ = environment;
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>promptgrade.ai</title>
        {assetPaths.cssPath && (
          <link rel="stylesheet" href={assetPaths.cssPath} />
        )}
        <script type="module" src={assetPaths.jsPath} />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <script
          type="module"
          defer
          dangerouslySetInnerHTML={{
            __html: `globalThis.__ENVIRONMENT__ = ${
              JSON.stringify(environment ?? {})
            };

          console.log("🔧 Environment ready, ClientRoot will handle hydration");
          `,
          }}
        />
      </body>
    </html>
  );
}
