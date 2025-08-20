import { iso } from "@iso-bfc";
import { PromptGradeProvider } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/PromptGradeContext.tsx";
import { Header } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/Header.tsx";
import { LeftSidebar } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/LeftSidebar.tsx";
import { MainContent } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/MainContent.tsx";
import { RightSidebar } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/RightSidebar.tsx";
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";

function EvalContent() {
  return (
    <div className="eval-page">
      <Header />
      <div className="eval-layout">
        <div className="eval-content">
          <LeftSidebar>
            <div>Navigation will go here</div>
          </LeftSidebar>
          <MainContent>
            <div>Main content will go here based on route</div>
          </MainContent>
          <RightSidebar title="Sidebar">
            <div>Optional sidebar content</div>
          </RightSidebar>
        </div>
      </div>
    </div>
  );
}

// TODO: Rebuild this component with proper Isograph patterns
// The old implementation mixed routing logic with data fetching
// New version should follow "resolvers all the way down" pattern

export const Eval = iso(`
  field Query.Eval @component {
    __typename
  }
`)(function Eval() {
  const { sendMessage: _sendMessage } = useHud();

  // Temporary placeholder while we rebuild with proper Isograph components
  return (
    <PromptGradeProvider>
      <EvalContent />
    </PromptGradeProvider>
  );
});
