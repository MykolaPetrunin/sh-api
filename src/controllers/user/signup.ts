import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { check, validationResult } from 'express-validator';
import User from '../../models/User';

const router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     description: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Error creating user
 */
router.post(
  '/',
  [
    check('username').not().isEmpty().withMessage('Username is required'),
    check('password').not().isEmpty().isStrongPassword().withMessage('Password is required'),
    check('email').isEmail().withMessage('Invalid email format'),
  ],
  async (req: Request, res: Response) => {
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
      });

      res.status(201).json({
        message: 'User created',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  },
);

export default router;
