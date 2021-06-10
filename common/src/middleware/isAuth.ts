import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../errors/ErrorResponse";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new ErrorResponse(401, "Unauthorized");
  }
  next();
};
