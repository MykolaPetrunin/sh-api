import { Response } from 'express';
import Token from '../../models/Token';
import { AuthRequest } from '../../middlewares/authenticateJWT';

export const revokeToken = async (req: AuthRequest, res: Response) => {
  const { tokenToRevoke } = req.body;
  const userId = req.currentUser?.id;

  if (tokenToRevoke && userId) {
    const result = await Token.destroy({
      where: {
        token: tokenToRevoke,
        user_id: userId,
      },
    });

    if (result > 0) {
      return res.status(200).json({ message: 'Token revoked' });
    } else {
      return res.status(400).json({ message: 'Invalid token or not owned by the user' });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
};
