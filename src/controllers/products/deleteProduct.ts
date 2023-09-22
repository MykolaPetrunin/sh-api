import Product from '../../models/Product';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { Response } from 'express';

export const deleteProduct = async (req: AuthRequest, res: Response) => {
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
};
