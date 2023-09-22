import express from 'express';
import { login } from '../controllers/users/login';
import { signup } from '../controllers/users/signup';
import { verifyEmail } from '../controllers/users/verifyEmail';
import { body, check, param } from 'express-validator';
import { validationErrors } from '../middlewares/validationErrors';
import { getCurrentUser } from '../controllers/users/getCurrentUser';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = express.Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     description: Login a user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must be a valid email address.
 *               password:
 *                 type: string
 *                 description: Must be at least 8 characters long.
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: Email not verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Error logging in
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email address'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  ],
  validationErrors,
  login,
);

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
 *                 description: The username of the user. Cannot be empty.
 *               password:
 *                 type: string
 *                 description: The password of the user. Must be at least 8 characters long.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user. Must be a valid email address.
 *     responses:
 *       201:
 *         description: User created and verification email sent
 *       400:
 *         description: Invalid request body. It will occur if any of the validations fail.
 *       500:
 *         description: Error creating user
 */
router.post(
  '/signup',
  [
    check('username').notEmpty().withMessage('Username is required'),
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    check('email').isEmail().withMessage('Invalid email address'),
  ],
  validationErrors,
  signup,
);

/**
 * @swagger
 * /api/users/verify-email/{verificationToken}:
 *   get:
 *     description: Verify a user's email address
 *     tags:
 *       - Users
 *     parameters:
 *       - name: verificationToken
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid verification token
 *       404:
 *         description: Token not found
 *       500:
 *         description: Error verifying email
 */
router.get(
  '/verify-email/:verificationToken',
  [param('verificationToken').isString().withMessage('verificationToken must be a string')],
  validationErrors,
  verifyEmail,
);

/**
 * @swagger
 * /api/users/current-user:
 *   get:
 *     description: Get current user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 is_email_verified:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/current-user', authenticateJWT, getCurrentUser);

export default router;
