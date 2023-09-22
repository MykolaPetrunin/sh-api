import { AuthRequest } from '../../middlewares/authenticateJWT';
import Recipe from '../../models/Recipe';
import { logger } from '../../config/logger';
import { Response } from 'express';
import { sequelize } from '../../config/sequelize';
import RecipeProduct from '../../models/RecipeProduct';

export const updateRecipe = async (req: AuthRequest, res: Response) => {
  const user_id = req.currentUser?.id;
  const { recipe_id } = req.params;
  const { title, products } = req.body;

  if (!user_id) {
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  const transaction = await sequelize.transaction();

  try {
    if (!title) {
      const updatedRecipe = await Recipe.update(
        { title },
        {
          where: { id: recipe_id, user_id },
          transaction,
        },
      );

      if (updatedRecipe[0] === 0) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Recipe not found or not owned by user' });
      }
    }

    if (products && Array.isArray(products)) {
      await RecipeProduct.destroy({ where: { recipe_id }, transaction });

      const recipeProducts = products.map((product) => ({
        recipe_id,
        product_id: product.product_id,
        quantity: product.quantity,
      }));

      await RecipeProduct.bulkCreate(recipeProducts, { transaction });
    }

    await transaction.commit();

    logger.info(`Recipe updated with id ${recipe_id}`);
    return res.status(200).json({ message: 'Recipe updated successfully' });
  } catch (error) {
    await transaction.rollback();
    logger.error('Error updating recipe:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
