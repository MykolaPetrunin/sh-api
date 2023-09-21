import express from 'express';
import { login } from '../controllers/users/login';
import { signup } from '../controllers/users/signup';

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
router.post('/login', login);

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
router.post('/signup', signup);

export default router;
