export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract message: string;
  abstract fields?: Record<string, string>;
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
  abstract serializeFields(): Record<string, string>;
}
