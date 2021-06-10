import jwt from "jsonwebtoken";
import { ErrorResponse } from "../errors/ErrorResponse";

interface Userdoc {
  id: string;
  email: string;
  password: string;
}

export interface AuthData {
  id: string;
  email: string;
  token: string;
}

export class JWT {
  static sign(user: Userdoc, expiresIn: string | number): AuthData {
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: expiresIn,
    });

    return {
      ...payload,
      token,
    };
  }
  static verify(token: string): AuthData {
    const data = jwt.verify(token, process.env.JWT_SECRET!) as AuthData;
    return {
      ...data,
      token,
    };
  }
}
