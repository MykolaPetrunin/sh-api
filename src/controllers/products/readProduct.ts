import { Response } from 'express';
import Product from '../../models/Product';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';

export const readProduct = async (req: AuthRequest, res: Response) => {
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
};
