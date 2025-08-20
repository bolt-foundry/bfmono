export default 'query EntrypointGradeDecks  {\
  id,\
  currentViewer {\
    __typename,\
    id,\
    orgBfOid,\
    personBfGid,\
    ... on CurrentViewerLoggedIn {\
      id,\
      __typename,\
      organization {\
        id,\
        decks____first___l_100: decks(first: 100) {\
          edges {\
            node {\
              id,\
              description,\
              name,\
              slug,\
            },\
          },\
        },\
        domain,\
        name,\
      },\
    },\
  },\
}';