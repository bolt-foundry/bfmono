import { Nav } from "@bfmono/apps/boltfoundry-com/components/Nav.tsx";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/components/mock/contexts/EvalContext.tsx";

export function Header() {
  const { setLeftSidebarOpen, leftSidebarOpen } = useEvalContext();

  return (
    <Nav
      page="eval"
      onSidebarToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
      sidebarOpen={leftSidebarOpen}
    />
  );
}
