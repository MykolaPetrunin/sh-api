import express from 'express';
import create from './create';
import deleteProduct from './delete';
import update from './update';
import read from './read';
import { Op, WhereOptions } from 'sequelize';
import Product from '../../models/Product';
import { authenticateJWT, AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { sequelize } from '../../config/sequelize';

const router = express.Router();

router.use('/create', create);

router.patch('/:productId', update);

router.get('/:productId', read);

router.delete('/:productId', deleteProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     description: Fetch products with cursor-based pagination, full-text search, and sorting
 *     tags:
 *       - Products
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of products to return (default is 10)
 *         schema:
 *           type: integer
 *       - name: cursor
 *         in: query
 *         required: false
 *         description: Cursor for pagination
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         required: false
 *         description: Full-text search query
 *         schema:
 *           type: string
 *       - name: sortField
 *         in: query
 *         required: false
 *         description: Field by which to sort the products
 *         schema:
 *           type: string
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         description: Order in which to sort the products ('ASC' or 'DESC')
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     hasNextPage:
 *                       type: boolean
 *                     newCursor:
 *                       type: string
 *       500:
 *         description: Internal Server Error
 */
router.get('/', authenticateJWT, async (req: AuthRequest, res) => {
  const userId = req.currentUser?.id;

  const limit = Number(req.query.limit) || 10;
  const cursor = req.query.cursor;
  const searchText = req.query.search;
  const sortField = (req.query.sortField as string) || 'created_at';
  const sortOrder = (req.query.sortOrder as string) || 'DESC';

  try {
    const whereClause: WhereOptions = {};

    if (cursor) {
      whereClause.id = { [Op.lt]: cursor };
    }

    if (searchText) {
      whereClause.title = { [Op.iLike]: `%${searchText}%` };
    }

    const products = await Product.findAll({
      where: whereClause,
      order: [
        [sequelize.literal(`CASE WHEN user_id = '${userId}' THEN 0 ELSE 1 END`), 'ASC'],
        [sortField, sortOrder],
      ],
      limit: limit + 1,
    });

    const hasNextPage = products.length > limit;
    if (hasNextPage) {
      products.pop();
    }

    const newCursor = hasNextPage ? products[products.length - 1].id : null;

    res.status(200).json({
      data: products,
      meta: {
        hasNextPage,
        newCursor,
      },
    });
  } catch (err) {
    logger.error(`Error fetching products: ${err}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
