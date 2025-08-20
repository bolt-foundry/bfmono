import { iso } from "@iso-bfc";

export const EntrypointGrade = iso(`
  field Query.EntrypointGrade {
    __typename
  }
`)(function EntrypointGrade() {
  // Server-side redirect to /pg/grade/decks
  return {
    Body: null,
    title: "Redirecting...",
    status: 302,
    headers: {
      Location: "/pg/grade/decks",
    },
  };
});
