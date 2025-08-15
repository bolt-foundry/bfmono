export default 'query EntrypointLogin  {\
  id,\
  currentViewer {\
    __typename,\
    id,\
    __typename,\
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
      person {\
        id,\
        email,\
        name,\
      },\
    },\
  },\
}';