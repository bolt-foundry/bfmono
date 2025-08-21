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
        decks____first___l_100: decks(first: 100) {\
          edges {\
            node {\
              id,\
              description,\
              graders____first___l_100: graders(first: 100) {\
                edges {\
                  node {\
                    id,\
                  },\
                },\
              },\
              name,\
              samples____first___l_100: samples(first: 100) {\
                edges {\
                  node {\
                    id,\
                    collectionMethod,\
                    name,\
                    telemetryData,\
                  },\
                },\
              },\
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