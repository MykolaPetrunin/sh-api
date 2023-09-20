import express, { Response } from 'express';
import Product from '../../models/Product';
import { authenticateJWT, AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { check, validationResult } from 'express-validator';

const router = express.Router();

/**
 * @swagger
 * /api/products/create:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     description: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proteins
 *               - carbohydrates
 *               - fats
 *               - title
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
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Error creating product
 */
router.post(
  '/',
  authenticateJWT,
  [
    check('proteins').isFloat({ min: 0 }).withMessage('Proteins must be a positive number'),
    check('carbohydrates').isFloat({ min: 0 }).withMessage('Carbohydrates must be a positive number'),
    check('fats').isFloat({ min: 0 }).withMessage('Fats must be a positive number'),
    check('title').isLength({ min: 1, max: 50 }).withMessage('Title must be between 1 and 50 characters'),
    check('barcode').optional().isLength({ max: 20 }).withMessage('Barcode must be maximum 20 characters'),
    check('description').optional().isString().withMessage('Description must be a string'),
  ],
  async (req: AuthRequest, res: Response) => {
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
  },
);

export default router;
