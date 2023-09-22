import { Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import Product from '../../models/Product';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { sequelize } from '../../config/sequelize';

export const allProducts = async (req: AuthRequest, res: Response) => {
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
};
