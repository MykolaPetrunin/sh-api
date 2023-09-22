import { Response } from 'express';
import Product from '../../models/Product';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { validationResult } from 'express-validator';

export const createProduct = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { proteins, carbohydrates, fats, title, barcode, description } = req.body;

  try {
    const newProduct = await Product.create({
      proteins,
      carbohydrates,
      fats,
      title,
      user_id: req.currentUser!.id,
      barcode,
      description,
    });

    res.status(201).json({ message: 'Product created', product: newProduct });
  } catch (error) {
    logger.error(JSON.stringify(error));
    res.status(500).json({ error: 'Failed to create product' });
  }
};
