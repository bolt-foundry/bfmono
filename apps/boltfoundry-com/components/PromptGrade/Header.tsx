import { Nav } from "@bfmono/apps/boltfoundry-com/components/Nav.tsx";
import { usePromptGradeContext } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/PromptGradeContext.tsx";

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
