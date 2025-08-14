export default 'mutation CreateDeck ($name: String!, $description: String, $content: String!, $slug: String!) {\
  createDeck____name___v_name____description___v_description____content___v_content____slug___v_slug: createDeck(name: $name, description: $description, content: $content, slug: $slug) {\
    id,\
    content,\
    description,\
    name,\
    slug,\
  },\
}';