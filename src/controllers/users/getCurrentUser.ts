import { Response } from 'express';
import User from '../../models/User';
import { AuthRequest } from '../../middlewares/authenticateJWT';

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const userId = req.currentUser?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findOne({
      where: {
        id: userId,
      },
      attributes: ['id', 'username', 'email', 'is_email_verified', 'created_at', 'updated_at'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
