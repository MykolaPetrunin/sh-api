import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { logger } from '../../config/logger';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import Recipe from '../../models/Recipe';
import { sequelize } from '../../config/sequelize';
import RecipeProduct from '../../models/RecipeProduct';

export const createRecipe = async (req: AuthRequest, res: Response) => {
  const { title, description, products } = req.body;
  const user_id = req.currentUser?.id;

  if (!user_id) {
    return res.status(401).json({ error: 'User is not authenticated' });
  }

  if (!(products && Array.isArray(products))) {
    return res.status(400).json({ error: 'Products is empty' });
  }

  const transaction = await sequelize.transaction();

  try {
    const recipe_id = uuidv4();

    const newRecipe = await Recipe.create(
      {
        id: recipe_id,
        title,
        description,
        user_id,
      },
      {
        transaction,
      },
    );

    const recipeProducts = products.map((product) => ({
      recipe_id,
      product_id: product.product_id,
      quantity: product.quantity,
    }));

    await RecipeProduct.bulkCreate(recipeProducts, { transaction });

    await transaction.commit();

    logger.info(`Recipe created with id ${newRecipe.get('id')}`);
    return res.status(201).json(newRecipe);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating recipe:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
