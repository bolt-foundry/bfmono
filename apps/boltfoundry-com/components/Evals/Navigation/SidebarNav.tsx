import React from "react";
import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "@bfmono/apps/bfDs/components/BfDsListItem.tsx";

export function SidebarNav() {
  // For now, hardcode that we're always on the Grade section
  const currentPath = typeof window !== "undefined"
    ? window.location.pathname
    : "/pg/grade";
  const isGradeActive = currentPath.startsWith("/pg/grade") ||
    currentPath === "/pg";

  return (
    <BfDsList header="Navigation">
      <BfDsListItem
        active={isGradeActive}
      >
        Grade
      </BfDsListItem>
      <BfDsListItem
        disabled={true}
      >
        Analyze
      </BfDsListItem>
      <BfDsListItem
        disabled={true}
      >
        Chat
      </BfDsListItem>
    </BfDsList>
  );
}
