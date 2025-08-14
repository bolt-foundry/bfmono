import { Nav } from "@bfmono/apps/boltfoundry-com/components/Nav.tsx";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";

export function Header() {
  const { setLeftSidebarOpen, leftSidebarOpen, currentViewer } =
    useEvalContext();

  return (
    <Nav
      page="eval"
      onSidebarToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
      sidebarOpen={leftSidebarOpen}
      currentViewer={currentViewer}
    />
  );
}
