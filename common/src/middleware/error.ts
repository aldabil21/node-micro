import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../errors/ErrorResponse";

type error = {
  success: boolean;
  statusCode: number;
  message: string;
  fields?: Record<string, string>;
};

export const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = err.statusCode || 500;

  const error = {
    success: false,
    statusCode: status,
    message: err.message || "Something Went Wrong",
    fields: err.serializeFields ? err.serializeFields() : {},
  } as error;

  res.status(status).json(error);
};
