/// <reference lib="deno.unstable" />

// deno-lint-ignore-file no-explicit-any

const IMPORT_TEXT =
  'import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";\n';

/* -------------------------------------------------------------------------- */
/*  Helper: add the import once (idempotent)                                  */
/* -------------------------------------------------------------------------- */
function ensureImport(
  sourceCode: any,
  fixer: any,
): Array<any> {
  const hasImport = sourceCode.ast.body.some(
    (n: any) =>
      n.type === "ImportDeclaration" &&
      n.source.value === "@bolt-foundry/get-configuration-var" &&
      n.specifiers.some(
        (s: any) =>
          (s.type === "ImportSpecifier" ||
            s.type === "ImportNamespaceSpecifier") &&
          s.local.name === "getConfigurationVariable",
      ),
  );
  if (hasImport) return [];

  const firstNode = sourceCode.ast.body[0];
  return firstNode
    ? [fixer.insertTextBefore(firstNode, IMPORT_TEXT)]
    : [fixer.insertTextBeforeRange([0, 0], IMPORT_TEXT)];
}

/* -------------------------------------------------------------------------- */
/*  Plugin                                                                    */
/* -------------------------------------------------------------------------- */
const plugin: any = {
  name: "bolt-foundry",
  rules: {
    /* ────────────────────────────────────────────────────────────────────── */
    /*  1. Deno.env → getConfigurationVariable                              */
    /* ────────────────────────────────────────────────────────────────────── */
    "no-env-direct-access": {
      create(context: any) {
        const { sourceCode } = context;

        return {
          'CallExpression[callee.property.name="get"][callee.object.property.name="env"][callee.object.object.name="Deno"]'(
            node: any,
          ) {
            context.report({
              node,
              message:
                "avoid Deno.env – use getConfigurationVariable() instead.",
              fix(fixer: any) {
                return [
                  fixer.replaceText(
                    node,
                    `getConfigurationVariable(${
                      sourceCode.getText(node.arguments[0])
                    })`,
                  ),
                  ...ensureImport(sourceCode, fixer),
                ];
              },
            });
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────── */
    /*  2. bfNodeSpec must NOT be the first static field                     */
    /* ────────────────────────────────────────────────────────────────────── */
    "no-bfnodespec-first-static": {
      create(context: any) {
        /** Check each class (declaration or expression). */
        function checkClass(node: any) {
          // Get static members in source order
          const staticMembers = node.body.body.filter(
            (m: any) => m.static,
          );
          if (staticMembers.length === 0) return;

          const first = staticMembers[0];
          const isBfNodeSpec = (first.type === "PropertyDefinition" ||
            first.type === "ClassProperty") &&
            first.key &&
            first.key.type === "Identifier" &&
            first.key.name === "bfNodeSpec";

          if (isBfNodeSpec) {
            context.report({
              node: first,
              message:
                "bfNodeSpec can't be the first static item… try declaring gqlSpec first.",
            });
          }
        }

        return {
          ClassDeclaration: checkClass,
          ClassExpression: checkClass,
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────── */
    /*  3. Rename _logger to logger when it's being used                     */
    /* ────────────────────────────────────────────────────────────────────── */
    "no-underscore-logger-when-used": {
      create(context: any) {
        const { sourceCode } = context;

        // Track _logger declarations and usages
        const underscoreLoggers = new Map(); // node -> isUsed

        return {
          // Find _logger declarations
          'VariableDeclarator[id.name="_logger"]'(node: any) {
            // Check if it's created by getLogger
            if (
              node.init &&
              node.init.type === "CallExpression" &&
              node.init.callee.type === "Identifier" &&
              node.init.callee.name === "getLogger"
            ) {
              underscoreLoggers.set(node, false);
            }
          },

          // Track when _logger is used
          'MemberExpression[object.name="_logger"]'() {
            // Mark all _logger declarations as used
            for (const [decl] of underscoreLoggers) {
              underscoreLoggers.set(decl, true);
            }
          },

          // Check at the end
          "Program:exit"() {
            for (const [node, isUsed] of underscoreLoggers) {
              if (isUsed) {
                context.report({
                  node: node.id,
                  message:
                    "_logger is being used and should be renamed to logger",
                  fix(fixer: any) {
                    const fixes = [];

                    // Replace the declaration
                    fixes.push(fixer.replaceText(node.id, "logger"));

                    // Find and replace all usages of _logger in the file
                    const text = sourceCode.getText();
                    const regex = /\b_logger\b/g;
                    let match;

                    while ((match = regex.exec(text)) !== null) {
                      const start = match.index;
                      const end = start + match[0].length;

                      // Skip the declaration itself
                      if (
                        start >= node.id.range[0] && end <= node.id.range[1]
                      ) {
                        continue;
                      }

                      fixes.push(
                        fixer.replaceTextRange([start, end], "logger"),
                      );
                    }

                    return fixes;
                  },
                });
              }
            }
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────── */
    /*  4. Prefer Array<Type> over Type[] syntax                             */
    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    "prefer-generic-array-syntax": {
      create(context: any) {
        const { sourceCode } = context;

        return {
          // Match array type annotations like Type[]
          TSArrayType(node: any) {
            context.report({
              node,
              message:
                "Use Array<Type> instead of Type[] for array type annotations",
              fix(fixer: any) {
                // Get the element type text
                const elementType = sourceCode.getText(node.elementType);

                // Handle cases where the element type might need parentheses
                // e.g., (string | number)[] -> Array<string | number>
                const needsParens = node.elementType.type === "TSUnionType" ||
                  node.elementType.type === "TSIntersectionType" ||
                  node.elementType.type === "TSConditionalType";

                const typeText = needsParens ? elementType : elementType;

                return [
                  fixer.replaceText(node, `Array<${typeText}>`),
                ];
              },
            });
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    /*  5. Discourage direct page usage in E2E tests                         */
    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    "no-direct-page-methods-in-e2e": {
      create(context: any) {
        const filename = context.filename;

        // Only apply to E2E test files
        if (
          !filename.includes(".e2e.ts") && !filename.includes(".test.e2e.ts")
        ) {
          return {};
        }

        return {
          // Match common page interaction methods
          'CallExpression[callee.property.name=/^(click|type|focus|hover|tap|dblclick|fill|selectOption|press|check|uncheck)$/][callee.object.name="page"]'(
            node: any,
          ) {
            const methodName = node.callee.property.name;
            context.report({
              node,
              message:
                `Direct page.${methodName}() is discouraged in E2E tests. Use context.${methodName}() for smooth, video-friendly interactions. If you must use page directly, use context.__UNSAFE_page_useContextMethodsInstead.${methodName}() to make it explicit.`,
            });
          },
          // Also catch page access from context.page
          'MemberExpression[property.name="page"][object.type="Identifier"]'(
            node: any,
          ) {
            // Skip if it's already the UNSAFE variant
            if (
              node.parent?.property?.name ===
                "__UNSAFE_page_useContextMethodsInstead"
            ) {
              return;
            }

            // Only flag if it's being used to call a method
            if (
              node.parent?.type === "MemberExpression" &&
              node.parent?.parent?.type === "CallExpression"
            ) {
              const methodName = node.parent.property?.name;
              if (
                methodName &&
                /^(click|type|focus|hover|tap|dblclick|fill|selectOption|press|check|uncheck)$/
                  .test(methodName)
              ) {
                context.report({
                  node: node.parent.parent,
                  message:
                    `Direct page.${methodName}() via context.page is discouraged. Use context.${methodName}() instead, or context.__UNSAFE_page_useContextMethodsInstead.${methodName}() if absolutely necessary.`,
                });
              }
            }
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    /*  6. Prevent logger.setLevel from being committed                      */
    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    "no-logger-set-level": {
      create(context: any) {
        const { sourceCode } = context;

        // Check if this file imports getLogger from our logger package
        function hasLoggerImport() {
          return sourceCode.ast.body.some(
            (n: any) =>
              n.type === "ImportDeclaration" &&
              n.source.value.includes("logger/logger.ts") &&
              n.specifiers.some(
                (s: any) =>
                  (s.type === "ImportSpecifier" ||
                    s.type === "ImportNamespaceSpecifier") &&
                  s.local.name === "getLogger",
              ),
          );
        }

        return {
          // Match any call to setLevel()
          'CallExpression[callee.property.name="setLevel"]'(node: any) {
            // Get the object the method is called on
            const objectNode = node.callee.object;

            // Flag for tracking if this is potentially a logger instance
            let isLoggerCall = false;

            // Direct match for variable named "logger"
            if (
              objectNode.type === "Identifier" && objectNode.name === "logger"
            ) {
              isLoggerCall = true;
            }

            // Check for any variable followed by .levels
            if (
              node.arguments.length > 0 &&
              node.arguments[0].type === "MemberExpression" &&
              node.arguments[0].property.name === "levels"
            ) {
              isLoggerCall = true;
            }

            // If we're in a file that imports our logger and this looks like a logger call
            if (
              (hasLoggerImport() && isLoggerCall) ||
              objectNode.name === "logger"
            ) {
              context.report({
                node,
                message:
                  "Avoid committing logger.setLevel() - this should be managed through environment variables.",
                fix(fixer: any) {
                  // Comment out the line rather than removing it completely
                  return [
                    fixer.insertTextBefore(
                      node,
                      "// UNCOMMENT FOR DEBUGGING ONLY: ",
                    ),
                  ];
                },
              });
            }
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    /*  6. Ensure files end with a newline                                   */
    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    "ensure-file-ends-with-newline": {
      create(context: any) {
        const { sourceCode } = context;

        return {
          "Program:exit"() {
            const text = sourceCode.getText();

            // Check if file is empty
            if (text.length === 0) {
              return;
            }

            // Check if file ends with a newline
            if (!text.endsWith("\n")) {
              // Report at the last character position
              const lastPosition = text.length;

              context.report({
                range: [lastPosition, lastPosition],
                message: "File must end with a newline character",
                fix(fixer: any) {
                  // Insert newline at the end of the file
                  return [
                    fixer.insertTextAfterRange(
                      [lastPosition, lastPosition],
                      "\n",
                    ),
                  ];
                },
              });
            }
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    /*  7. Enforce @ts-expect-error has a description                         */
    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    "ts-expect-error-description": {
      create(context: any) {
        const { sourceCode } = context;
        const text = sourceCode.getText();
        const lines = text.split("\n");

        return {
          "Program:exit"() {
            // Find all @ts-expect-error comments
            lines.forEach((line: any, lineIndex: any) => {
              const tsExpectErrorMatch = line.match(
                /^\s*(\/\/\s*@ts-expect-error)(\s*[:\-–]?\s*(.+))?/,
              );
              if (tsExpectErrorMatch) {
                const description = tsExpectErrorMatch[3];

                // Check if there's no description or if it's too generic
                if (!description || description.trim().length === 0) {
                  const columnStart = tsExpectErrorMatch.index || 0;

                  context.report({
                    range: [
                      lines.slice(0, lineIndex).join("\n").length +
                      (lineIndex > 0 ? 1 : 0) + columnStart,
                      lines.slice(0, lineIndex).join("\n").length +
                      (lineIndex > 0 ? 1 : 0) + line.length,
                    ],
                    message:
                      "@ts-expect-error directive must include a description explaining why it's needed",
                  });
                }
              }
            });
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    /*  8. No parent directory traversal - enforce repository-relative URLs   */
    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    "no-parent-directory-traversal": {
      create(context: any) {
        const { filename } = context;

        // Helper to convert relative path to repository-relative
        function convertToRepoRelative(
          relativePath: string,
          currentFile: string,
        ): string {
          // Count how many directories up we need to go
          const upCount = (relativePath.match(/\.\.\//g) || []).length;
          if (upCount === 0) return relativePath;

          // For files in the monorepo, we can calculate based on known structure
          // Remove any leading absolute path to get relative path
          let filePath = currentFile;
          const monorepoIndex = filePath.lastIndexOf("/bolt-foundry-monorepo/");
          if (monorepoIndex !== -1) {
            filePath = filePath.slice(
              monorepoIndex + "/bolt-foundry-monorepo/".length,
            );
          }

          // Get the current file's directory segments
          const currentDir = filePath.split("/").slice(0, -1);

          // Go up the required number of directories
          const baseDir = currentDir.slice(0, -upCount);

          // Get the remaining path after all ../
          const remainingPath = relativePath.replace(/^(\.\.\/)+/, "");

          // Construct the new path with @bfmono/ prefix
          if (baseDir.length === 0) {
            return "@bfmono/" + remainingPath;
          }

          return "@bfmono/" + baseDir.join("/") + "/" + remainingPath;
        }

        // For TypeScript/JavaScript files only
        return {
          ImportDeclaration(node: any) {
            const importPath = node.source.value;
            if (
              typeof importPath === "string" && importPath.includes("../..")
            ) {
              context.report({
                node: node.source,
                message:
                  "Use repository-relative imports instead of parent directory traversal",
                fix(fixer: any) {
                  const newPath = convertToRepoRelative(importPath, filename);
                  return [
                    fixer.replaceText(
                      node.source,
                      `"${newPath}"`,
                    ),
                  ];
                },
              });
            }
          },
          // Also check dynamic imports
          'CallExpression[callee.name="import"]'(node: any) {
            if (
              node.arguments.length > 0 && node.arguments[0].type === "Literal"
            ) {
              const importPath = node.arguments[0].value;
              if (
                typeof importPath === "string" && importPath.includes("../..")
              ) {
                context.report({
                  node: node.arguments[0],
                  message:
                    "Use repository-relative imports instead of parent directory traversal",
                  fix(fixer: any) {
                    const newPath = convertToRepoRelative(importPath, filename);
                    return [
                      fixer.replaceText(
                        node.arguments[0],
                        `"${newPath}"`,
                      ),
                    ];
                  },
                });
              }
            }
          },
        };
      },
    },

    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    /*  9. Enforce @bfmono/ prefix for cornercased imports                    */
    /* ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
    "no-cornercased-imports": {
      create(context: any) {
        // Pattern to match cornercased imports (apps/, packages/, infra/, etc.)
        const cornercasedPattern =
          /^(apps|packages|infra|lib|util|experimental|content|docs|static|tmp)\//;

        return {
          ImportDeclaration(node: any) {
            const importPath = node.source.value;

            if (
              typeof importPath === "string" &&
              cornercasedPattern.test(importPath)
            ) {
              context.report({
                node: node.source,
                message:
                  `Use @bfmono/ prefix for internal imports instead of bare "${
                    importPath.split("/")[0]
                  }/" paths`,
                fix(fixer: any) {
                  const newPath = "@bfmono/" + importPath;
                  return [
                    fixer.replaceText(node.source, `"${newPath}"`),
                  ];
                },
              });
            }
          },

          // Also check dynamic imports
          'CallExpression[callee.name="import"]'(node: any) {
            if (
              node.arguments.length > 0 && node.arguments[0].type === "Literal"
            ) {
              const importPath = node.arguments[0].value;

              if (
                typeof importPath === "string" &&
                cornercasedPattern.test(importPath)
              ) {
                context.report({
                  node: node.arguments[0],
                  message:
                    `Use @bfmono/ prefix for internal imports instead of bare "${
                      importPath.split("/")[0]
                    }/" paths`,
                  fix(fixer: any) {
                    const newPath = "@bfmono/" + importPath;
                    return [
                      fixer.replaceText(node.arguments[0], `"${newPath}"`),
                    ];
                  },
                });
              }
            }
          },
        };
      },
    },
  },
};

export default plugin;
