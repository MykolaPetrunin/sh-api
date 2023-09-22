import { AuthRequest } from '../../middlewares/authenticateJWT';
import Recipe from '../../models/Recipe';
import Product from '../../models/Product';
import RecipeProduct from '../../models/RecipeProduct'; // Assuming you have a junction table
import { Response } from 'express';
import { Op } from 'sequelize';

export const recipesByProduct = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const limit = Number(req.query.limit) || 10;
  const cursor = req.query.cursor;
  const userId = req.currentUser?.id;

  try {
    const productExists = await Product.findOne({
      where: {
        id: productId,
        user_id: userId,
      },
    });

    if (!productExists) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const recipeIdsWithProduct = await RecipeProduct.findAll({
      where: { product_id: productId },
      attributes: ['recipe_id'],
    });

    const recipeIds = recipeIdsWithProduct.map((item) => item.get('recipe_id'));

    const recipes = await Recipe.findAll({
      limit: limit + 1,
      where: {
        id: {
          [Op.in]: recipeIds,
          ...(cursor ? { [Op.gt]: cursor } : {}),
        },
        user_id: userId,
      },
      order: [['title', 'ASC']],
    });

    const hasNextPage = recipes.length > limit;
    const newCursor = hasNextPage ? recipes[recipes.length - 2].id : null;

    if (hasNextPage) {
      recipes.pop();
    }

    res.status(200).json({
      data: recipes,
      meta: {
        hasNextPage,
        newCursor,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
