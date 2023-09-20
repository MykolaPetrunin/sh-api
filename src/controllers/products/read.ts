import { Router } from 'express';
import Product from '../../models/Product';
import { authenticateJWT, AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';

const router = Router();

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     description: Get a product
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully fetched
 *       403:
 *         description: Unauthorized or the product does not belong to the user
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:productId', authenticateJWT, async (req: AuthRequest, res) => {
  const userId = req.currentUser?.id;
  const productId = req.params.productId;

  try {
    const product = await Product.findOne({ where: { id: productId, user_id: userId } });

    if (!product) {
      logger.warn(`Product with id ${productId} not found for user ${userId}`);
      return res.status(404).json({ message: 'Product not found or not owned by you' });
    }

    logger.info(`Successfully fetched product with id ${productId} for user ${userId}`);
    res.status(200).json(product);
  } catch (err) {
    logger.error(`Error fetching product: ${err}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
