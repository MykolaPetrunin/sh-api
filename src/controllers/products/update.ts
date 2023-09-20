import { Router } from 'express';
import Product from '../../models/Product';
import { authenticateJWT, AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';

const router = Router();

/**
 * @swagger
 * /api/products/{productId}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     description: Update a product
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proteins:
 *                 type: number
 *                 format: float
 *               carbohydrates:
 *                 type: number
 *                 format: float
 *               fats:
 *                 type: number
 *                 format: float
 *               title:
 *                 type: string
 *               barcode:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product successfully updated
 *       403:
 *         description: Unauthorized or the product does not belong to the user
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.patch('/:productId', authenticateJWT, async (req: AuthRequest, res) => {
  const userId = req.currentUser?.id;
  const productId = req.params.productId;

  // Restrict the fields that can be updated
  const { proteins, carbohydrates, fats, title, barcode, description } = req.body;

  // Filter out undefined fields before updating
  const validFields = { proteins, carbohydrates, fats, title, barcode, description };
  const fieldsToUpdate = Object.fromEntries(Object.entries(validFields).filter(([, value]) => value !== undefined));

  try {
    const [updatedRowCount, [updatedProduct]] = await Product.update(fieldsToUpdate, {
      where: { id: productId, user_id: userId },
      returning: true,
      individualHooks: true,
    });

    if (updatedRowCount === 0) {
      logger.warn(`Failed to update product with id ${productId} for user ${userId}`);
      return res.status(404).json({ message: 'Product not found or not owned by you' });
    }

    logger.info(`Successfully updated product with id ${productId} for user ${userId}`);
    res.status(200).json(updatedProduct);
  } catch (err) {
    logger.error(`Error updating product: ${err}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
