import Product from '../../models/Product';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { Response } from 'express';

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const userId = req.currentUser?.id;
  const productId = req.params.productId;

  const { proteins, carbohydrates, fats, title, barcode, description } = req.body;

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
};
