export default 'query EntrypointEval  {\
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
        decks____first___l_10: decks(first: 10) {\
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