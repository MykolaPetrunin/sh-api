import { NextFunction, Response } from 'express';
import { AuthRequest } from './authenticateJWT';
import { validationResult } from 'express-validator';

export const validationErrors = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
