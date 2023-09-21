import express from 'express';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { revokeToken } from '../controllers/tokens/revokeToken';

const router = express.Router();

/**
 * @swagger
 * /api/token/revoke:
 *   post:
 *     description: Revoke an existing token
 *     tags:
 *       - Tokens
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenToRevoke
 *             properties:
 *               tokenToRevoke:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token revoked
 *       400:
 *         description: Invalid token or not owned by the user / Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post('/revoke', authenticateJWT, revokeToken);

export default router;
