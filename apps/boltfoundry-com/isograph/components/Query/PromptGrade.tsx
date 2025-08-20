import { iso } from "@iso-bfc";
import { PromptGradeProvider } from "@bfmono/apps/boltfoundry-com/contexts/PromptGradeContext.tsx";
import { Header } from "@bfmono/apps/boltfoundry-com/components/Evals/Layout/Header.tsx";
import { LeftSidebar } from "@bfmono/apps/boltfoundry-com/components/Evals/Layout/LeftSidebar.tsx";
import { MainContent } from "@bfmono/apps/boltfoundry-com/components/Evals/Layout/MainContent.tsx";
import { RightSidebar } from "@bfmono/apps/boltfoundry-com/components/Evals/Layout/RightSidebar.tsx";

function PromptGradeContent() {
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

/**
 * PromptGrade component - Main layout orchestrator for the grading interface
 * Replaces the old Eval.tsx component with proper Isograph patterns
 *
 * This component:
 * - Is exposed as a field on Query type
 * - Will reference Nav and other components as Isograph fields (TODO)
 * - Provides the PromptGradeContext for state management
 * - Orchestrates the layout with Header, Sidebars, and MainContent
 */
export const PromptGrade = iso(`
  field Query.PromptGrade @component {
    __typename
  }
`)(function PromptGrade(_props) {
  // TODO: Once Nav is converted to Isograph, reference it as a field:
  // field Query.PromptGrade @component {
  //   Nav
  //   currentViewer {
  //     __typename
  //   }
  // }
  // Then use props.data.Nav instead of importing Header

  return (
    <PromptGradeProvider>
      <PromptGradeContent />
    </PromptGradeProvider>
  );
});
