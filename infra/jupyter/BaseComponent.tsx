// import { colors, colorsDark, fonts } from "@bfmono/apps/cfDs/const.tsx"; // cfDs deleted
const colors = {};
const colorsDark = {};
const fonts = {};

const varsString = Object.entries({ ...colors, ...fonts }).reduce(
  (acc, [key, value]) => {
    acc += `--${key}: ${value};\n`;
    return acc;
  },
  "",
);
const varsDarkString = Object.entries({ ...colorsDark }).reduce(
  (acc, [key, value]) => {
    acc += `--${key}: ${value};\n`;
    return acc;
  },
  "",
);

const cssVarsString = `:root {\n${varsString}}\n`;
const cssVarsDarkString = `:root[data-theme=dark] {\n${varsDarkString}}\n`;

type Props = React.PropsWithChildren<{
  sourceModuleText: string;
  environment: Record<string, unknown>;
}>;

export function BaseComponent(
  { children, environment, sourceModuleText }: Props,
) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style
          dangerouslySetInnerHTML={{
            __html: cssVarsString + cssVarsDarkString,
          }}
        />
        <link rel="stylesheet" href="/static/marketingpagestyle.css" />
        <link rel="stylesheet" href="/static/cfDsStyle.css" />
        <link rel="stylesheet" href="/static/blogStyle.css" />
        <link rel="stylesheet" href="/static/appStyle.css" />
        <link rel="stylesheet" href="/static/toolsStyle.css" />
        <link rel="stylesheet" href="/static/lexicalStyle.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans:wght@200;400;500;700&family=Bebas+Neue&display=swap&family=Roboto:wght@300&display=swap"
          rel="stylesheet"
        />
        <link
          rel="shortcut icon"
          type="image/jpg"
          href="https://bf-static-assets.s3.amazonaws.com/favicon.ico"
        />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <div id="modal-root" className="portalRoot"></div>
        <div id="tooltip-root" className="portalRoot"></div>
        <div id="toast-root" className="portalRoot"></div>
        <div id="staging-root" className="portalRoot"></div>
        <script
          type="module"
          defer
          dangerouslySetInnerHTML={{
            __html: `globalThis.__ENVIRONMENT__ = ${
              JSON.stringify(environment)
            };
            ${sourceModuleText}
            globalThis.__REHYDRATE__(globalThis.__ENVIRONMENT__);`,
          }}
        />
      </body>
    </html>
  );
}
