export default 'query EntrypointDeckDetail  {\
  id,\
  currentViewer {\
    __typename,\
    id,\
    ... on CurrentViewerLoggedIn {\
      id,\
      __typename,\
      organization {\
        id,\
        name,\
      },\
    },\
  },\
}';