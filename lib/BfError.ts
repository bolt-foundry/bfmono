export class BfError extends Error {
}
export class BfErrorNotImplemented extends BfError {
  override message = "Not implemented";
}
export class BfErrorNotFound extends BfError {
  constructor(message = "Not found") {
    super(message);
    this.name = "BfErrorNotFound";
  }
}
export class BfErrorExampleImplementation extends BfErrorNotImplemented {
  override message = "Replace this example with your own";
}
