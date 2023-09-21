import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Token from '../models/Token';

export interface AuthRequest extends Request {
  currentUser?: {
    token?: string | JwtPayload;
    id: string;
  };
}

export const authenticateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (token) {
    const tokenInDb = await Token.findOne({
      where: {
        token,
      },
    });

    if (!tokenInDb) {
      return res.status(403).json({ error: 'Token is revoked or unauthorized' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      const userId = tokenInDb.get('user_id');
      req.currentUser = {
        token: decoded,
        id: userId,
      };
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
