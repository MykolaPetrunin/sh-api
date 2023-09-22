import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import User from '../../models/User';
import EmailVerificationToken from '../../models/EmailVerificationToken';
import { logger } from '../../config/logger';
import crypto from 'crypto';
import EmailService from '../../services/EmailService';

const { APP_URL } = process.env;

if (!APP_URL) {
  throw new Error('Mail serer configuration variables are missing');
}

export const signup = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      is_email_verified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await EmailVerificationToken.create({
      user_id: newUser.get('id'),
      token: verificationToken,
      expires_at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Expires in 24 hours
    });

    const emailService = EmailService.getInstance();
    const verificationUrl = `${APP_URL}/api/users/verify-email/${verificationToken}`;
    await emailService.sendEmail(
      email,
      'Please verify your email address',
      `<a href="${verificationUrl}">Click here</a> to verify your email address.`,
    );

    res.status(201).json({
      message: 'User created and verification email sent',
    });
  } catch (error) {
    logger.error(JSON.stringify(error));
    res.status(500).json({ error: 'Failed to create user' });
  }
};
