// Adapted from https://usehooks-ts.com/react-hook/use-copy-to-clipboard
import * as React from "react";
const { useState } = React;

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>; // Return success

export function useCopyToClipboard(): [CopiedValue, CopyFn] {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);

  const copy: CopyFn = async (text) => {
    if (!navigator?.clipboard) {
      // deno-lint-ignore no-console
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      // deno-lint-ignore no-console
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  };

  return [copiedText, copy];
}
