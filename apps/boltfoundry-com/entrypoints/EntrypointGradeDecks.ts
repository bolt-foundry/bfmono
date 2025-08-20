import { iso } from "@iso-bfc";

export const EntrypointGradeDecks = iso(`
  field Query.EntrypointGradeDecks {
    Grade
  }
`)(function EntrypointGradeDecks({ data }) {
  const Body = data.Grade;
  const title = "Decks - Grade - Bolt Foundry";
  return { Body, title };
});
