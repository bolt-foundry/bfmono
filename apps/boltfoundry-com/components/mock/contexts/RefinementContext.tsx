import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface RefinementProgress {
  graderId: string;
  graderName: string;
  status: "pending" | "refining" | "completed" | "failed" | "dismissed";
  progress: number; // 0-100
  currentStage: "analyze" | "adjust" | "test" | "complete";
  stageProgress: {
    analyze: number; // 0-100
    adjust: number; // 0-100
    test: number; // 0-100
  };
  startTime?: number;
  endTime?: number;
  hasDispatched?: boolean;
}

export interface RefinementResult {
  graderId: string;
  graderName: string;
  previousAccuracy: number;
  newAccuracy: number;
  samplesProcessed: number;
  testSamplesUsed: number;
  improvementSummary: string;
  changesApplied: {
    parametersAdjusted: Array<string>;
    biasCorrection: string;
    thresholdChanges: Array<
      { parameter: string; oldValue: number; newValue: number }
    >;
  };
}

interface RefinementContextType {
  isRefining: boolean;
  refinementProgress: Array<RefinementProgress>;
  startRefinement: (progressData: Array<RefinementProgress>) => void;
  stopRefinement: () => void;
  updateProgress: (progressData: Array<RefinementProgress>) => void;
  updateProgressStatus: (
    graderId: string,
    status: RefinementProgress["status"],
  ) => void;
}

const RefinementContext = createContext<RefinementContextType | null>(null);

export function useRefinementContext() {
  const context = useContext(RefinementContext);
  if (!context) {
    throw new Error(
      "useRefinementContext must be used within a RefinementProvider",
    );
  }
  return context;
}

// Mock update function (same as in modal)
function mockUpdateProgress(
  progressData: Array<RefinementProgress>,
): Promise<Array<RefinementProgress>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const updated = progressData.map((item) => {
        if (item.status === "completed" || item.status === "failed") {
          return item;
        }

        let newStatus: RefinementProgress["status"] = item.status;
        let newStage = item.currentStage;
        const newStageProgress = { ...item.stageProgress };

        if (item.status === "pending") {
          newStatus = "refining";
        }

        // Update current stage progress
        const increment = Math.random() * 30 + 15; // 15-45% increment

        switch (item.currentStage) {
          case "analyze":
            newStageProgress.analyze = Math.min(
              item.stageProgress.analyze + increment,
              100,
            );
            if (newStageProgress.analyze >= 100) {
              newStage = "adjust";
            }
            break;
          case "adjust":
            newStageProgress.adjust = Math.min(
              item.stageProgress.adjust + increment,
              100,
            );
            if (newStageProgress.adjust >= 100) {
              newStage = "test";
            }
            break;
          case "test": {
            // Test stage takes longer (smaller increments)
            const testIncrement = Math.random() * 20 + 10; // 10-30%
            newStageProgress.test = Math.min(
              item.stageProgress.test + testIncrement,
              100,
            );
            if (newStageProgress.test >= 100) {
              newStage = "complete";
              newStatus = Math.random() > 0.1 ? "completed" : "failed"; // 90% success rate
            }
            break;
          }
          case "complete":
            newStatus = "completed";
            break;
        }

        // Calculate overall progress (weighted: analyze 20%, adjust 30%, test 50%)
        const overallProgress = Math.round(
          (newStageProgress.analyze * 0.2) +
            (newStageProgress.adjust * 0.3) +
            (newStageProgress.test * 0.5),
        );

        return {
          ...item,
          progress: overallProgress,
          status: newStatus,
          currentStage: newStage,
          stageProgress: newStageProgress,
          endTime: newStatus === "completed" || newStatus === "failed"
            ? Date.now()
            : undefined,
        };
      });
      resolve(updated);
    }, 500 + Math.random() * 1000); // 0.5-1.5 second delay
  });
}

export function RefinementProvider(
  { children }: { children: React.ReactNode },
) {
  const [isRefining, setIsRefining] = useState(false);
  const [refinementProgress, setRefinementProgress] = useState<
    Array<RefinementProgress>
  >([]);
  const timerRef = useRef<number | null>(null);

  const startRefinement = useCallback(
    (progressData: Array<RefinementProgress>) => {
      setIsRefining(true);
      setRefinementProgress(progressData);
    },
    [],
  );

  const stopRefinement = useCallback(() => {
    setIsRefining(false);
    setRefinementProgress([]);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(
    (progressData: Array<RefinementProgress>) => {
      setRefinementProgress(progressData);
    },
    [],
  );

  const updateProgressStatus = useCallback(
    (graderId: string, status: RefinementProgress["status"]) => {
      setRefinementProgress((prev) =>
        prev.map((progress) =>
          progress.graderId === graderId ? { ...progress, status } : progress
        )
      );
    },
    [],
  );

  // Refinement timer effect
  useEffect(() => {
    if (!isRefining || refinementProgress.length === 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const allDismissed = refinementProgress.every((p) =>
      p.status === "dismissed"
    );

    // Check for newly completed items to dispatch events
    const newlyCompleted = refinementProgress.filter((p) =>
      (p.status === "completed" || p.status === "failed") &&
      !p.hasDispatched
    );

    if (newlyCompleted.length > 0) {
      // Mark as dispatched and send events
      setRefinementProgress((prev) =>
        prev.map((progress) => {
          if (newlyCompleted.some((nc) => nc.graderId === progress.graderId)) {
            globalThis.dispatchEvent(
              new CustomEvent("refinementComplete", {
                detail: {
                  graderId: progress.graderId,
                  results: {
                    newAccuracy: Math.random() * 20 + 80,
                    previousAccuracy: Math.random() * 20 + 60,
                    improvementSummary: "Refinement completed successfully",
                  },
                },
              }),
            );
            return { ...progress, hasDispatched: true };
          }
          return progress;
        })
      );
    }

    if (allDismissed) {
      // All callouts have been dismissed, clean up
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setIsRefining(false);
      return;
    }

    // Only start timer if we don't already have one running
    if (!timerRef.current) {
      const updateTimer = setTimeout(async () => {
        const updated = await mockUpdateProgress(refinementProgress);
        setRefinementProgress(updated);

        // Dispatch progress events for each grader
        updated.forEach((progress) => {
          globalThis.dispatchEvent(
            new CustomEvent("refinementProgress", {
              detail: {
                graderId: progress.graderId,
                progress: {
                  stage: progress.currentStage,
                  progress: progress.progress,
                  eta: progress.currentStage === "complete"
                    ? "Complete"
                    : progress.progress < 50
                    ? "2-3 min"
                    : progress.progress < 80
                    ? "1-2 min"
                    : "< 1 min",
                },
              },
            }),
          );
        });

        // Clear the timer ID after execution
        timerRef.current = null;
      }, 750);

      timerRef.current = updateTimer as unknown as number;
    }
  }, [isRefining, refinementProgress]);

  return (
    <RefinementContext.Provider
      value={{
        isRefining,
        refinementProgress,
        startRefinement,
        stopRefinement,
        updateProgress,
        updateProgressStatus,
      }}
    >
      {children}
    </RefinementContext.Provider>
  );
}
