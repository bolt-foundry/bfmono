// Mock data for demonstration
export const mockDecks = [
  {
    id: "fastpitch",
    name: "Fastpitch Story Selection",
    description:
      "Evaluates the quality of curated AI news story selections from the latest articles",
    graderCount: 3,
    lastModified: "2025-08-12",
    status: "active" as const,
    agreementRate: 88,
    totalTests: 156,
  },
  {
    id: "1",
    name: "Customer Support Quality",
    description:
      "Evaluates helpfulness, accuracy, and tone of customer support responses",
    graderCount: 0,
    lastModified: "2025-07-24",
    status: "active" as const,
    agreementRate: 0,
    totalTests: 0,
  },
  {
    id: "2",
    name: "Code Generation Accuracy",
    description:
      "Tests correctness, efficiency, and best practices in generated code",
    graderCount: 8,
    lastModified: "2025-07-23",
    status: "active" as const,
    agreementRate: 87,
    totalTests: 3420,
  },
  {
    id: "3",
    name: "Content Moderation",
    description: "Ensures appropriate content filtering and safety guidelines",
    graderCount: 3,
    lastModified: "2025-07-22",
    status: "inactive" as const,
    agreementRate: 95,
    totalTests: 892,
  },
];

export function getDeckNameById(deckId: string): string {
  const deck = mockDecks.find((d) => d.id === deckId);
  return deck?.name || `Deck ${deckId}`;
}
