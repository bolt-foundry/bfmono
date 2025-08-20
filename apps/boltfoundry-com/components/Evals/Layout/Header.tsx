import { Nav } from "@bfmono/apps/boltfoundry-com/components/Nav.tsx";
import { usePromptGradeContext } from "@bfmono/apps/boltfoundry-com/contexts/PromptGradeContext.tsx";

export function Header() {
  const { setLeftSidebarOpen, leftSidebarOpen } = usePromptGradeContext();

  return (
    <Nav
      page="eval"
      onSidebarToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
      sidebarOpen={leftSidebarOpen}
    />
  );
}
