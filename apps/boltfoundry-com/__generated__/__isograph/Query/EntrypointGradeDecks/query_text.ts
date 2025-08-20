export default 'query EntrypointGradeDecks  {\
  id,\
  currentViewer {\
    __typename,\
    id,\
    __typename,\
    ... on CurrentViewerLoggedIn {\
      id,\
      __typename,\
      organization {\
        id,\
        decks____first___l_50: decks(first: 50) {\
          edges {\
            node {\
              id,\
              description,\
              name,\
              slug,\
            },\
          },\
        },\
        name,\
      },\
    },\
    ... on CurrentViewerLoggedOut {\
      __typename,\
      id,\
      __typename,\
    },\
  },\
}';