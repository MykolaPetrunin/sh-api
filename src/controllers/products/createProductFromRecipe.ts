import { AuthRequest } from '../../middlewares/authenticateJWT';
import Product from '../../models/Product';
import { Response } from 'express';
import Recipe from '../../models/Recipe';

export const createProductFromRecipe = async (req: AuthRequest, res: Response) => {
  const userId = req.currentUser?.id;
  const { recipeId, title, description, totalWeight } = req.body;

  if (!userId || !recipeId || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const recipe = await Recipe.findOne({
      where: { id: recipeId },
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity'] },
        },
      ],
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found or not owned by user' });
    }

    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbs = 0;
    let totalQuantity = 0;

    const products = recipe.get('products')!;
    for (const product of products) {
      const recipeProduct = product.get('RecipeProduct')!;
      const factor = recipeProduct.get('quantity')! / 100;
      totalQuantity += recipeProduct.get('quantity')!;
      totalProteins += product.get('proteins') * factor;
      totalFats += product.get('fats') * factor;
      totalCarbs += product.get('carbohydrates') * factor;
    }

    if (totalWeight) totalQuantity = totalWeight;

    const proteinsPer100g = (totalProteins / totalQuantity) * 100;
    const fatsPer100g = (totalFats / totalQuantity) * 100;
    const carbsPer100g = (totalCarbs / totalQuantity) * 100;

    const newProduct = await Product.create({
      title,
      description,
      user_id: userId,
      proteins: proteinsPer100g,
      fats: fatsPer100g,
      carbohydrates: carbsPer100g,
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
