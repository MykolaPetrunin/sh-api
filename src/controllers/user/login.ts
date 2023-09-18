import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Token from '../../models/Token';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     description: Log in an existing user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 required: true
 *               password:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Incorrect password
 *       404:
 *         description: User not found
 *       500:
 *         description: Error logging in
 */
router.post(
  '/',
  [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
  ],
  async (req: Request, res: Response) => {
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

      const dbPassword = user.get('password');
      const isPasswordValid = await bcrypt.compare(password, dbPassword);

      if (!isPasswordValid) {
        return res.status(401).send('Incorrect password');
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key');

      await Token.create({
        userId: user.get('id'),
        token,
        userAgent,
      });

      res.json({ token });
    } catch (error) {
      res.status(500).send('Error logging in');
    }
  },
);

export default router;
