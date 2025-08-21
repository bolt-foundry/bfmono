# BfNode Framework Technical Debt

This folder contains documentation of known technical debt and limitations in
the BfNode framework that should be addressed to improve developer experience
and type safety.

## Issues

### [Relationship Methods Typing](./relationship-methods-typing.md)

**Problem**: BfNode subclasses can't call relationship methods (like
`createSamplesItem()`) on `this` without casting due to TypeScript not knowing
about dynamically added methods.

**Status**: Needs framework fix with automatic declaration merging via codegen

### [JSON Field Typing](./json-field-typing.md)

**Problem**: `.json()` fields expect strict `JSONValue` type but real-world data
structures (OpenAI responses, etc.) don't conform to this typing without
casting.

**Status**: Needs framework fix to be more permissive with JSON field types

## Priority

Both issues impact daily development productivity and require manual workarounds
(casting). The relationship methods issue is higher priority as it affects core
framework usage patterns.

## Solutions

Both issues have documented solution approaches and can be implemented
independently. They represent opportunities to improve the framework's
ergonomics without breaking existing functionality.
