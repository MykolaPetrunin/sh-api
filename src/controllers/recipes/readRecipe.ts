import { Request, Response } from 'express';
import { logger } from '../../config/logger';
import Recipe from '../../models/Recipe';
import Product from '../../models/Product';

export const readRecipe = async (req: Request, res: Response) => {
  const recipeId = req.params.recipeId;

  try {
    const recipe = await Recipe.findOne({
      where: { id: recipeId },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['title', 'proteins', 'carbohydrates', 'fats'],
          through: {
            attributes: ['quantity'],
            as: 'product_info',
          },
        },
      ],
    });

    if (!recipe) {
      logger.warn(`Recipe with id ${recipeId} not found`);
      return res.status(404).json({ message: 'Recipe not found' });
    }

    res.status(200).json(recipe);
  } catch (err) {
    logger.error(`Error fetching recipe: ${err}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
