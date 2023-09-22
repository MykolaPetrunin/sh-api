import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Token from '../../models/Token';
import { validationResult } from 'express-validator';

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (!user.get('is_email_verified')) {
      return res.status(403).send('Email not verified');
    }

    const dbPassword = user.get('password');
    const isPasswordValid = await bcrypt.compare(password, dbPassword);

    if (!isPasswordValid) {
      return res.status(401).send('Incorrect password');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');

    await Token.create({
      user_id: user.get('id'),
      token,
      user_agent: userAgent,
    });

    res.json({ token });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
};
