import { Request } from "express";
import { validationResult } from "express-validator";
import { CustomError } from "./CustomError";

export class ErrorResponse extends CustomError {
  constructor(
    public statusCode: number,
    public message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields || {};
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }
  static validateRequest(req: Request) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsObj = {} as Record<string, string>;
      for (const err of errors.array()) {
        errorsObj[err.param] = err.msg;
      }
      throw new ErrorResponse(422, "validation error", errorsObj);
    }
  }
  serializeFields() {
    return this.fields || {};
  }
}
