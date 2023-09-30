import { Response } from 'express';
import { Op, WhereOptions } from 'sequelize';
import Recipe from '../../models/Recipe';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { sequelize } from '../../config/sequelize';

export const allRecipes = async (req: AuthRequest, res: Response) => {
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

    const recipes = await Recipe.findAll({
      where: whereClause,
      order: [
        [sequelize.literal(`CASE WHEN user_id = '${userId}' THEN 0 ELSE 1 END`), 'ASC'],
        [sortField, sortOrder],
      ],
      limit: limit + 1,
    });

    const hasNextPage = recipes.length > limit;
    if (hasNextPage) {
      recipes.pop();
    }

    const newCursor = hasNextPage ? recipes[recipes.length - 1].get('id') : null;

    res.status(200).json({
      data: recipes,
      meta: {
        hasNextPage,
        newCursor,
      },
    });
  } catch (err) {
    logger.error(`Error fetching recipes: ${err}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
