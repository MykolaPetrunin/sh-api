import Recipe from '../../models/Recipe';
import { AuthRequest } from '../../middlewares/authenticateJWT';
import { logger } from '../../config/logger';
import { Response } from 'express';

export const deleteRecipe = async (req: AuthRequest, res: Response) => {
  const userId = req.currentUser?.id;
  const recipeId = req.params.recipeId;

  try {
    const deletedRowCount = await Recipe.destroy({ where: { id: recipeId, user_id: userId } });

    if (deletedRowCount === 0) {
      logger.warn(`Failed to delete recipe with id ${recipeId} for user ${userId}`);
      return res.status(404).json({ message: 'Recipe not found or not owned by you' });
    }

    logger.info(`Successfully deleted recipe with id ${recipeId} for user ${userId}`);
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    logger.error(`Error deleting recipe: ${err}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
