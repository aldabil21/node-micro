import { Request, Response, NextFunction } from "express";
import { JWT, AuthData } from "../services/JWT";

declare global {
  namespace Express {
    interface Request {
      user?: AuthData | null;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let data;
    if (req.session?.token) {
      data = JWT.verify(req.session.token) as AuthData;
    }
    req.user = data || null;
    next();
  } catch (error) {
    next();
  }
};
