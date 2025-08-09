# Deno Doc to GraphQLNodes Integration

## Overview

Integration plan for consuming Deno Doc output as GraphQLNodes in bfdb, enabling
automated documentation extraction and GraphQL schema generation from TypeScript
source files.

## Current State Analysis

### GraphQLNodes Structure (bfdb)

The bfdb system uses a hierarchical class structure for GraphQL entities:

1. **GraphQLObjectBase** - Base class providing:
   - `__typename` field for GraphQL type identification
   - `id` field (with auto-generated fallback)
   - `defineGqlNode()` method for fluent field definition
   - `toGraphql()` method for GraphQL-compatible output

2. **GraphQLNode** - Abstract class extending GraphQLObjectBase:
   - Implements Node interface for Relay compatibility
   - Requires concrete `id` implementation
   - Provides `find()` and `findX()` methods for retrieval

3. **GqlNodeSpec** - Structure defining:
   - `fields`: Scalar field definitions
   - `relations`: Object relationships
   - `mutations`: Mutation definitions
   - `connections`: Connection types (future)

### Deno Doc JSON Output

Deno Doc generates JSON with the following structure:

```json
{
  "version": 1,
  "nodes": [
    {
      "name": "SymbolName",
      "kind": "class|interface|function|variable|enum|typeAlias",
      "location": { "filename", "line", "col" },
      "jsDoc": { "doc", "tags" },
      "declarationKind": "export|declare",
      // Type-specific definitions...
    }
  ]
}
```

Key node types:

- **Classes**: `classDef` with constructors, properties, methods
- **Interfaces**: `interfaceDef` with properties, methods
- **Functions**: `functionDef` with params, returnType
- **Types**: `typeAliasDef` with tsType
- **Enums**: `enumDef` with members

## Implementation Requirements

### Core Requirements

1. **Transform Pipeline**: Convert Deno Doc JSON → GraphQLNode instances
2. **Type Mapping**: Map TypeScript types → GraphQL scalar/object types
3. **Relationship Detection**: Identify object references for GraphQL relations
4. **Documentation Preservation**: Maintain JSDoc as GraphQL descriptions
5. **Dynamic Schema Generation**: Auto-generate GraphQL schema from TypeScript

### Technical Considerations

1. **Type System Mapping**:
   - TypeScript primitives → GraphQL scalars (string, number, boolean)
   - TypeScript Date → GraphQL ISODate
   - TypeScript arrays → GraphQL lists (not yet supported in builder)
   - TypeScript unions/intersections → Custom GraphQL types
   - TypeScript generics → GraphQL type parameters

2. **Inheritance Handling**:
   - Map TypeScript `extends` → GraphQL interface implementation
   - Preserve class hierarchy in GraphQL schema
   - Handle abstract classes as GraphQL interfaces

3. **Module Resolution**:
   - Resolve import paths for cross-file references
   - Build dependency graph for related types
   - Handle circular dependencies with thunks

## Proposed Implementation

### Phase 1: Parser & Transformer

Create `apps/bfDb/documentation/DenoDocParser.ts`:

```typescript
export class DenoDocParser {
  // Parse Deno Doc JSON output
  static parseDocumentation(json: DenoDocJson): ParsedDocumentation;

  // Transform to intermediate representation
  static transformToIR(parsed: ParsedDocumentation): DocumentationIR;

  // Generate documentation index and files
  static generateDocFiles(ir: DocumentationIR): void;
}
```

### Phase 2: File-Based Documentation Node

Create a file-based documentation node similar to BlogPost:

```typescript
export class DocumentedSymbol extends GraphQLNode {
  private static _cache = new Map<string, Promise<DocumentedSymbol>>();

  // Load from generated JSON files
  static async findX(path: string): Promise<DocumentedSymbol> {
    const docPath = join("docs/generated/api", `${path}.json`);
    const content = await Deno.readTextFile(docPath);
    return new DocumentedSymbol(JSON.parse(content));
  }

  // List all documented symbols
  static async listAll(): Promise<Array<DocumentedSymbol>> {
    const indexPath = "docs/generated/api/index.json";
    const index = JSON.parse(await Deno.readTextFile(indexPath));
    return Promise.all(index.symbols.map((s) => this.findX(s.path)));
  }

  // Create Relay connection
  static connection(
    symbols: Array<DocumentedSymbol>,
    args: ConnectionArguments,
  ): Promise<Connection<DocumentedSymbol>> {
    return Promise.resolve(connectionFromArray(symbols, args));
  }

  static override gqlSpec = this.defineGqlNode((gql) =>
    gql
      .nonNull.id("id")
      .nonNull.string("name")
      .string("description")
      .json("jsDoc")
      .string("kind") // class, interface, function, etc.
      .json("location")
      // Use connections for related symbols instead of arrays
      .connection("properties", () => DocumentedSymbol, {
        resolve: async (root, args) => {
          const props = await root.getProperties();
          return DocumentedSymbol.connection(props, args);
        },
      })
      .connection("methods", () => DocumentedSymbol, {
        resolve: async (root, args) => {
          const methods = await root.getMethods();
          return DocumentedSymbol.connection(methods, args);
        },
      })
      .object("extends", () => DocumentedSymbol)
  );
}
```

### Phase 3: Build Pipeline

1. **Generate Documentation JSON**:
   ```bash
   # Run Deno Doc and save to disk
   deno doc --json apps/bfDb/**/*.ts > docs/generated/api/raw.json

   # Transform to individual symbol files
   bft doc:transform docs/generated/api/raw.json
   ```

2. **File Structure**:
   ```
   docs/generated/api/
   ├── index.json           # Symbol index with paths and metadata
   ├── classes/
   │   ├── BfNode.json
   │   ├── GraphQLNode.json
   │   └── ...
   ├── interfaces/
   │   └── ...
   └── functions/
       └── ...
   ```

3. **Index Format**:
   ```json
   {
     "generated": "2024-01-15T10:00:00Z",
     "symbols": [
       {
         "name": "BfNode",
         "kind": "class",
         "path": "classes/BfNode",
         "module": "apps/bfDb/classes/BfNode.ts"
       }
     ]
   }
   ```

### Phase 4: GraphQL Query Integration

Add to Query root:

```typescript
.connection("documentation", () => DocumentedSymbol, {
  args: (a) => a
    .string("kind")     // Filter by symbol kind
    .string("module")   // Filter by source module
    .string("search"),  // Search in names/descriptions
  resolve: async (_root, args) => {
    let symbols = await DocumentedSymbol.listAll();
    
    // Apply filters
    if (args.kind) {
      symbols = symbols.filter(s => s.kind === args.kind);
    }
    if (args.module) {
      symbols = symbols.filter(s => s.module === args.module);
    }
    if (args.search) {
      // Simple text search
      const term = args.search.toLowerCase();
      symbols = symbols.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }
    
    return DocumentedSymbol.connection(symbols, args);
  }
})
```

## Example Usage

```bash
# Generate documentation GraphQL nodes
bft doc:graphql apps/bfDb/**/*.ts

# Query documentation via GraphQL
query {
  documentedClass(name: "BfNode") {
    description
    properties {
      name
      type
      optional
    }
    methods {
      name
      parameters
      returnType
    }
  }
}
```

## Benefits

1. **Unified Documentation System**: Single source of truth for code
   documentation
2. **Type-Safe Queries**: GraphQL provides type-safe documentation access
3. **Cross-Reference Support**: Link related types through GraphQL relations
4. **Live Documentation**: Always up-to-date with source code
5. **IDE Integration**: Generate GraphQL schema for IDE autocomplete
6. **File-Based Storage**: No database persistence needed, just JSON files on
   disk
7. **Relay Connections**: Avoids array limitations, provides pagination out of
   the box

## Next Steps

1. Prototype the DenoDocParser with basic type mapping
2. Create DocumentedNode GraphQL classes
3. Build CLI integration with bft
4. Test with existing bfdb classes
5. Extend GraphQL builder for missing features

## Technical Debt & Limitations

1. **Array Support**: Solved by using Relay connections instead of arrays
2. **Generic Types**: No current support for type parameters in GraphQL
3. **Union Types**: Limited GraphQL union support
4. **Circular Dependencies**: Need careful handling with thunks
5. **File I/O**: Each query reads from disk, but caching mitigates performance
   impact

## Resources

- [Deno Doc API](https://deno.land/manual/tools/documentation_generator)
- [GraphQL Schema Documentation](https://graphql.org/learn/schema/)
- bfdb GraphQL implementation: `/bfmono/apps/bfDb/graphql/`
- GqlBuilder: `/bfmono/apps/bfDb/builders/graphql/`
