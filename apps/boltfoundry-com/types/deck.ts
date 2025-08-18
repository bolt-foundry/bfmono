export enum DeckTab {
  Samples = "samples",
  Graders = "graders",
  Inbox = "inbox",
}

export const DECK_TABS = Object.values(DeckTab) as Array<string>;

export function isDeckTab(value: string): value is DeckTab {
  return DECK_TABS.includes(value);
}
