import express, { Response } from 'express';
import Token from '../../models/Token';
import { authenticateJWT, AuthRequest } from '../../middlewares/authenticateJWT';

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
router.post('/', authenticateJWT, async (req: AuthRequest, res: Response) => {
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
});

export default router;
