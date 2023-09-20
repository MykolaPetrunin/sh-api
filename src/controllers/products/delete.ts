import { Router } from 'express';
import Product from '../../models/Product';
import { authenticateJWT, AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';

const router = Router();

/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     description: Delete a product
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully deleted
 *       403:
 *         description: Unauthorized or the product does not belong to the user
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:productId', authenticateJWT, async (req: AuthRequest, res) => {
  const userId = req.currentUser?.id;
  const productId = req.params.productId;

  try {
    const deletedRowCount = await Product.destroy({ where: { id: productId, user_id: userId } });

    if (deletedRowCount === 0) {
      logger.warn(`Failed to delete product with id ${productId} for user ${userId}`);
      return res.status(404).json({ message: 'Product not found or not owned by you' });
    }

    logger.info(`Successfully deleted product with id ${productId} for user ${userId}`);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting product: ${err}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
export default router;
