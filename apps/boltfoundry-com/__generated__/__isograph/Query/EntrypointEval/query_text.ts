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
        domain,\
        name,\
      },\
    },\
  },\
}';