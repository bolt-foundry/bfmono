import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "@bfmono/apps/bfDs/components/BfDsListItem.tsx";

export function SidebarNav() {
  // For now, hardcode that we're always on the Grade section
  const currentPath = typeof window !== "undefined"
    ? globalThis.location.pathname
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
        disabled
      >
        Analyze
      </BfDsListItem>
      <BfDsListItem
        disabled
      >
        Chat
      </BfDsListItem>
    </BfDsList>
  );
}
