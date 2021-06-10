import { Request, Response, NextFunction } from "express";
import { ErrorResponse, JWT, AuthData } from "@aldabil/microservice-common";
import { User, Userdoc } from "../model/user";

export const getUser = (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;
  res.status(200).json({ success: !!user, data: user });
};

export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ErrorResponse.validateRequest(req);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorResponse(422, "Incorrect Credentials");
    }

    const isEqual = await User.comparePassword(password, user.password);

    if (!isEqual) {
      throw new ErrorResponse(422, "Incorrect Credentials");
    }

    // Generate Token
    const data = generateToken(user);
    req.session = {
      token: data.token,
    };

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    next(error);
  }
};
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ErrorResponse.validateRequest(req);
    const { email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      throw new ErrorResponse(422, "Already Exists");
    }

    const user = User.add({ email, password });
    await user.save();

    // Generate Token
    const data = generateToken(user);
    req.session = {
      token: data.token,
    };

    res.status(201).json({ success: true, data: data });
  } catch (error) {
    next(error);
  }
};
export const signOut = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.session = null;
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};
// Helpers
const generateToken = (user: Userdoc): AuthData => {
  return JWT.sign(user, 900);
};
