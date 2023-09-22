import { Request, Response } from 'express';
import EmailVerificationToken from '../../models/EmailVerificationToken';
import User from '../../models/User';
import { logger } from '../../config/logger';

export const verifyEmail = async (req: Request, res: Response) => {
  const { verificationToken } = req.params;

  try {
    const tokenRecord = await EmailVerificationToken.findOne({ where: { token: verificationToken } });

    if (!tokenRecord) {
      return res.status(404).json({ message: 'Token not found' });
    }

    const user = await User.findOne({ where: { id: tokenRecord.get('user_id') } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.set('is_email_verified', true);
    await user.save();

    await tokenRecord.destroy();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error(JSON.stringify(error));
    res.status(500).json({ message: 'Internal server error' });
  }
};
