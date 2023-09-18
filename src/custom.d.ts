import 'express';
import { JwtPayload } from 'jsonwebtoken';

declare module 'express' {
  export interface Request {
    currentUser?: {
      token?: string | JwtPayload;
      id: string;
    };
  }
}
