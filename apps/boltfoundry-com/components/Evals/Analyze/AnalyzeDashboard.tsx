import { useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsCard } from "@bfmono/apps/bfDs/components/BfDsCard.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/components/BfDsInput.tsx";
import { BfDsSelect } from "@bfmono/apps/bfDs/components/BfDsSelect.tsx";
import { DisagreementCard } from "./DisagreementCard.tsx";
import { type Disagreement, ResolutionModal } from "./ResolutionModal.tsx";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// Mock data for demonstration
const mockDisagreements: Array<Disagreement> = [
  {
    id: "1",
    sampleId: "sample_123",
    prompt: "What are the benefits of renewable energy?",
    response:
      "Renewable energy sources like solar and wind power offer numerous advantages including environmental benefits, cost savings over time, and energy independence. They help reduce greenhouse gas emissions and create sustainable jobs.",
    graderScores: {
      "accuracy": { grader1: 85, grader2: 92, grader3: 78 },
      "helpfulness": { grader1: 90, grader2: 88, grader3: 95 },
      "relevance": { grader1: 88, grader2: 85, grader3: 82 },
    },
    avgDisagreement: 7.2,
    priority: "high" as const,
    status: "pending" as const,
    createdAt: "2025-07-24T10:30:00Z",
  },
  {
    id: "2",
    sampleId: "sample_124",
    prompt: "How does machine learning work?",
    response:
      "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from data without being explicitly programmed. It uses algorithms to identify patterns and make predictions.",
    graderScores: {
      "accuracy": { grader1: 75, grader2: 88, grader3: 82 },
      "clarity": { grader1: 80, grader2: 92, grader3: 85 },
      "completeness": { grader1: 70, grader2: 85, grader3: 78 },
    },
    avgDisagreement: 8.5,
    priority: "medium" as const,
    status: "pending" as const,
    createdAt: "2025-07-24T09:15:00Z",
  },
  {
    id: "3",
    sampleId: "sample_125",
    prompt: "Explain quantum computing concepts",
    response:
      "Quantum computing harnesses quantum mechanical phenomena like superposition and entanglement to process information in ways classical computers cannot. This enables solving certain complex problems exponentially faster.",
    graderScores: {
      "accuracy": { grader1: 92, grader2: 78, grader3: 95 },
      "technical_depth": { grader1: 88, grader2: 75, grader3: 90 },
      "accessibility": { grader1: 70, grader2: 85, grader3: 72 },
    },
    avgDisagreement: 9.1,
    priority: "high" as const,
    status: "pending" as const,
    createdAt: "2025-07-24T08:45:00Z",
  },
];

const mockStats = {
  totalDisagreements: 156,
  pendingResolution: 42,
  resolvedToday: 18,
  avgDisagreementScore: 7.8,
  topCategories: ["accuracy", "helpfulness", "relevance"],
};

interface AnalyzeDashboardProps {
  deckId?: string;
}

export function AnalyzeDashboard({ deckId: _deckId }: AnalyzeDashboardProps) {
  const { openRightSidebar } = useEvalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedDisagreement, setSelectedDisagreement] = useState<
    string | null
  >(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  const filteredDisagreements = mockDisagreements.filter((disagreement) => {
    const matchesSearch =
      disagreement.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disagreement.response.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      disagreement.status === statusFilter;
    const matchesPriority = priorityFilter === "all" ||
      disagreement.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleResolveDisagreement = (disagreementId: string) => {
    setSelectedDisagreement(disagreementId);
    setShowResolutionModal(true);
  };

  const handleResolutionSubmit = (
    resolution: {
      method: string;
      scores: Record<string, number>;
      notes?: string;
    },
  ) => {
    logger.info("Resolving disagreement:", selectedDisagreement, resolution);
    // TODO: Implement resolution logic with GraphQL mutation
    setShowResolutionModal(false);
    setSelectedDisagreement(null);
  };

  return (
    <div className="analyze-dashboard">
      <div className="view-header">
        <h2>Analysis dashboard</h2>
        <p className="view-description">
          Review grader disagreements and resolve scoring conflicts to improve
          evaluation quality
        </p>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <BfDsCard>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Disagreements</span>
              <span className="stat-value">{mockStats.totalDisagreements}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pending Resolution</span>
              <span className="stat-value priority-high">
                {mockStats.pendingResolution}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Resolved Today</span>
              <span className="stat-value priority-success">
                {mockStats.resolvedToday}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Disagreement</span>
              <span className="stat-value">
                {mockStats.avgDisagreementScore}%
              </span>
            </div>
          </div>
        </BfDsCard>
      </div>

      {/* Filters and Actions */}
      <div className="dashboard-controls">
        <div className="controls-left">
          <BfDsInput
            placeholder="Search disagreements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <BfDsSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All status" },
              { value: "pending", label: "Pending" },
              { value: "resolved", label: "Resolved" },
              { value: "dismissed", label: "Dismissed" },
            ]}
          />
          <BfDsSelect
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: "all", label: "All priority" },
              { value: "high", label: "High priority" },
              { value: "medium", label: "Medium priority" },
              { value: "low", label: "Low priority" },
            ]}
          />
        </div>
        <div className="controls-right">
          <BfDsButton
            variant="outline"
            onClick={() => openRightSidebar("Analysis Settings")}
          >
            Settings
          </BfDsButton>
          <BfDsButton
            variant="primary"
            onClick={() => openRightSidebar("Export Results")}
          >
            Export
          </BfDsButton>
        </div>
      </div>

      {/* Disagreements List */}
      <div className="disagreements-section">
        <h3>Disagreements Requiring Resolution</h3>

        {filteredDisagreements.length === 0
          ? (
            <BfDsEmptyState
              icon="checkCircle"
              title={searchQuery || statusFilter !== "all" ||
                  priorityFilter !== "all"
                ? "No disagreements found"
                : "No pending disagreements"}
              description={searchQuery || statusFilter !== "all" ||
                  priorityFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "All grader disagreements have been resolved. Great work!"}
              action={searchQuery || statusFilter !== "all" ||
                  priorityFilter !== "all"
                ? {
                  label: "Clear filters",
                  onClick: () => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  },
                }
                : undefined}
            />
          )
          : (
            <div className="disagreements-list">
              {filteredDisagreements.map((disagreement) => (
                <DisagreementCard
                  key={disagreement.id}
                  disagreement={disagreement}
                  onResolve={() => handleResolveDisagreement(disagreement.id)}
                  onViewDetails={() =>
                    openRightSidebar(`Disagreement ${disagreement.id}`)}
                />
              ))}
            </div>
          )}
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && selectedDisagreement && (
        <ResolutionModal
          disagreement={mockDisagreements.find((d) =>
            d.id === selectedDisagreement
          )!}
          onClose={() => {
            setShowResolutionModal(false);
            setSelectedDisagreement(null);
          }}
          onSubmit={handleResolutionSubmit}
        />
      )}
    </div>
  );
}
