import { iso } from "@iso-bfc";

export const EntrypointPg = iso(`
  field Query.EntrypointPg {
    __typename
  }
`)(function EntrypointPg() {
  // Redirect to /pg/grade
  return {
    Body: null,
    title: "Redirecting...",
    status: 302,
    headers: {
      Location: "/pg/grade",
    },
  };
});
