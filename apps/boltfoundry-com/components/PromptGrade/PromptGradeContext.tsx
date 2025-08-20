import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

type HumanGrade = {
  grades: Array<{
    graderId: string;
    score: -3 | -2 | -1 | 1 | 2 | 3;
    reason: string;
  }>;
  gradedBy: string;
  gradedAt: string;
};

type MainView = "Decks" | "Analyze" | "Chat";
type ChatMode = null | "createDeck";
type SidebarMode = "normal" | "grading";

interface PromptGradeContextType {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeMainContent: MainView;
  rightSidebarContent: string | null;
  rightSidebarMode: SidebarMode;
  leftSidebarStateBeforeRightOpen: boolean;
  chatMode: ChatMode;
  chatBackTarget: MainView | null;

  // Grading state
  gradingDeckId: string | null;
  gradingDeckName: string | null;

  // Samples state - central storage
  deckSamples: Record<string, Array<GradingSample>>; // deckId -> samples
  samplesLoading: Record<string, boolean>; // deckId -> loading state

  // Completion state
  recentlyCompletedSamples: Record<string, Array<string>>; // deckId -> sampleIds
  completionSummaries: Record<
    string,
    { totalGraded: number; averageScore: number }
  >; // deckId -> summary

  setLeftSidebarOpen: (open: boolean) => void;
  setActiveMainContent: (content: MainView) => void;
  openRightSidebar: (content: string) => void;
  closeRightSidebar: () => void;
  startDeckCreation: () => void;
  exitChatMode: () => void;
  startGrading: (deckId: string, deckName: string) => void;
  exitGrading: () => void;

  // Samples management
  setSamplesForDeck: (deckId: string, samples: Array<GradingSample>) => void;
  setSamplesLoading: (deckId: string, loading: boolean) => void;
  updateSampleGrade: (
    deckId: string,
    sampleId: string,
    humanGrade: HumanGrade,
  ) => void;

  markSamplesCompleted: (
    deckId: string,
    gradedSamples: Array<
      {
        sampleId: string;
        grades: Array<
          { graderId: string; score: -3 | -2 | -1 | 1 | 2 | 3; reason: string }
        >;
      }
    >,
    avgScore: number,
  ) => void;
  clearCompletionStatus: (deckId: string) => void;
}

const PromptGradeContext = createContext<PromptGradeContextType | undefined>(
  undefined,
);

// Helper function to detect mobile
const isMobile = () => {
  if (typeof window === "undefined") return false;
  return globalThis.innerWidth <= 768;
};

export function PromptGradeProvider({ children }: { children: ReactNode }) {
  const [leftSidebarOpen, setLeftSidebarOpenState] = useState(() =>
    !isMobile()
  );
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeMainContent, setActiveMainContent] = useState<MainView>("Decks");
  const [rightSidebarContent, setRightSidebarContent] = useState<string | null>(
    null,
  );
  const [rightSidebarMode, setRightSidebarMode] = useState<SidebarMode>(
    "normal",
  );
  const [leftSidebarStateBeforeRightOpen, setLeftSidebarStateBeforeRightOpen] =
    useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>(null);
  const [chatBackTarget, setChatBackTarget] = useState<MainView | null>(null);

  // Grading state
  const [gradingDeckId, setGradingDeckId] = useState<string | null>(null);
  const [gradingDeckName, setGradingDeckName] = useState<string | null>(null);

  // Samples state - central storage
  const [deckSamples, setDeckSamples] = useState<
    Record<string, Array<GradingSample>>
  >({});
  const [samplesLoading, setSamplesLoadingState] = useState<
    Record<string, boolean>
  >({});

  // Completion state
  const [recentlyCompletedSamples, setRecentlyCompletedSamples] = useState<
    Record<string, Array<string>>
  >({});
  const [completionSummaries, setCompletionSummaries] = useState<
    Record<string, { totalGraded: number; averageScore: number }>
  >({});

  const setLeftSidebarOpen = (open: boolean) => {
    setLeftSidebarOpenState(open);
  };

  const openRightSidebar = (content: string) => {
    if (!rightSidebarOpen) {
      // Remember current left sidebar state before opening right sidebar
      setLeftSidebarStateBeforeRightOpen(leftSidebarOpen);
      // Close left sidebar when opening right sidebar
      setLeftSidebarOpenState(false);
    }
    setRightSidebarContent(content);
    setRightSidebarOpen(true);
  };

  const closeRightSidebar = () => {
    setRightSidebarOpen(false);
    setRightSidebarContent(null);
    setRightSidebarMode("normal");
    // Restore left sidebar to its previous state
    setLeftSidebarOpenState(leftSidebarStateBeforeRightOpen);
  };

  const startDeckCreation = () => {
    setChatBackTarget(activeMainContent);
    setChatMode("createDeck");
    setActiveMainContent("Chat");
    openRightSidebar("Deck Creation");
  };

  const exitChatMode = () => {
    setChatMode(null);
    closeRightSidebar();
    if (chatBackTarget) {
      setActiveMainContent(chatBackTarget);
      setChatBackTarget(null);
    }
  };

  const startGrading = (deckId: string, deckName: string) => {
    setGradingDeckId(deckId);
    setGradingDeckName(deckName);
    setRightSidebarMode("grading");
    openRightSidebar("Grading Inbox");
  };

  const exitGrading = () => {
    setGradingDeckId(null);
    setGradingDeckName(null);
    setRightSidebarMode("normal");
    closeRightSidebar();
  };

  const markSamplesCompleted = (
    deckId: string,
    gradedSamples: Array<
      {
        sampleId: string;
        grades: Array<
          { graderId: string; score: -3 | -2 | -1 | 1 | 2 | 3; reason: string }
        >;
      }
    >,
    avgScore: number,
  ) => {
    // Mock GraphQL mutation effect - update samples with grades
    const sampleIds = gradedSamples.map((g) => g.sampleId);

    // Update samples with humanGrade data
    setDeckSamples((prev) => ({
      ...prev,
      [deckId]: prev[deckId]?.map((sample) => {
        const gradedSample = gradedSamples.find((g) =>
          g.sampleId === sample.id
        );
        if (gradedSample) {
          return {
            ...sample,
            humanGrade: {
              grades: gradedSample.grades,
              gradedBy: "current-user",
              gradedAt: new Date().toISOString(),
            },
          };
        }
        return sample;
      }) || [],
    }));

    // Update completion state for UI indicators
    setRecentlyCompletedSamples((prev) => ({
      ...prev,
      [deckId]: sampleIds,
    }));
    setCompletionSummaries((prev) => ({
      ...prev,
      [deckId]: {
        totalGraded: sampleIds.length,
        averageScore: avgScore,
      },
    }));
  };

  const clearCompletionStatus = (deckId: string) => {
    setRecentlyCompletedSamples((prev) => {
      const updated = { ...prev };
      delete updated[deckId];
      return updated;
    });
    setCompletionSummaries((prev) => {
      const updated = { ...prev };
      delete updated[deckId];
      return updated;
    });
  };

  // Samples management functions
  const setSamplesForDeck = (deckId: string, samples: Array<GradingSample>) => {
    setDeckSamples((prev) => ({
      ...prev,
      [deckId]: samples,
    }));
  };

  const setSamplesLoading = (deckId: string, loading: boolean) => {
    setSamplesLoadingState((prev) => ({
      ...prev,
      [deckId]: loading,
    }));
  };

  const updateSampleGrade = (
    deckId: string,
    sampleId: string,
    humanGrade: HumanGrade,
  ) => {
    setDeckSamples((prev) => ({
      ...prev,
      [deckId]:
        prev[deckId]?.map((sample) =>
          sample.id === sampleId ? { ...sample, humanGrade } : sample
        ) || [],
    }));
  };

  return (
    <PromptGradeContext.Provider
      value={{
        leftSidebarOpen,
        rightSidebarOpen,
        activeMainContent,
        rightSidebarContent,
        rightSidebarMode,
        leftSidebarStateBeforeRightOpen,
        chatMode,
        chatBackTarget,
        gradingDeckId,
        gradingDeckName,
        deckSamples,
        samplesLoading,
        recentlyCompletedSamples,
        completionSummaries,
        setLeftSidebarOpen,
        setActiveMainContent,
        openRightSidebar,
        closeRightSidebar,
        startDeckCreation,
        exitChatMode,
        startGrading,
        exitGrading,
        setSamplesForDeck,
        setSamplesLoading,
        updateSampleGrade,
        markSamplesCompleted,
        clearCompletionStatus,
      }}
    >
      {children}
    </PromptGradeContext.Provider>
  );
}

export function usePromptGradeContext() {
  const context = useContext(PromptGradeContext);
  if (context === undefined) {
    throw new Error(
      "usePromptGradeContext must be used within a PromptGradeProvider",
    );
  }
  return context;
}
