import express from 'express';
import { createRecipe } from '../controllers/recipes/createRecipe';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { check, param, query } from 'express-validator';
import { deleteRecipe } from '../controllers/recipes/deleteRecipe';
import { allRecipes } from '../controllers/recipes/allRecipes';
import { updateRecipe } from '../controllers/recipes/updateRecipe';
import { validationErrors } from '../middlewares/validationErrors';
import { readRecipe } from '../controllers/recipes/readRecipe';
import { recipesByProduct } from '../controllers/recipes/recipesByProduct';

const router = express.Router();

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Fetch recipes with cursor-based pagination, full-text search, and sorting
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of recipes to return (default is 10). Must be an integer greater than 0.
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - name: cursor
 *         in: query
 *         required: false
 *         description: Cursor for pagination. Must be a string.
 *         schema:
 *           type: string
 *       - name: search
 *         in: query
 *         required: false
 *         description: Full-text search query. Must be a string.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                      type: object
 *                      properties:
 *                          id:
 *                              type: string
 *                          title:
 *                              type: string
 *                          description:
 *                              type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     hasNextPage:
 *                       type: boolean
 *                     newCursor:
 *                       type: string
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.get(
  '/',
  authenticateJWT,
  [
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer greater than 0').toInt(),
    query('cursor').optional().isString().withMessage('Cursor must be a string'),
    query('search').optional().isString().withMessage('Search must be a string').trim(),
  ],
  validationErrors,
  allRecipes,
);

/**
 * @swagger
 * /api/recipes:
 *  post:
 *     security:
 *       - bearerAuth: []
 *     summary: Create a new recipe
 *     tags:
 *       - Recipes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - products
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               products:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *     responses:
 *       201:
 *         description: Recipe created
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/',
  authenticateJWT,
  [
    check('title').notEmpty().withMessage('Title is required'),
    check('description').optional().isString().withMessage('Description must be a string'),
    check('products').isArray().withMessage('Products must be an array'),
    check('products')
      .custom((value) => value.length > 0)
      .withMessage('At least one product is required'),
    check('products.*.product_id').isUUID().withMessage('Product ID must be a valid UUID'),
    check('products.*.quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than 0'),
  ],
  validationErrors,
  createRecipe,
);

/**
 * @swagger
 * /api/recipes/{recipeId}:
 *   get:
 *     summary: Fetch a specific recipe by ID along with its list of products and their quantities
 *     tags:
 *       - Recipes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: recipeId
 *         in: path
 *         required: true
 *         description: The ID of the recipe to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched recipe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 Products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       proteins:
 *                         type: number
 *                       carbohydrates:
 *                         type: number
 *                       fats:
 *                         type: number
 *                       RecipeProduct:
 *                         type: object
 *                         properties:
 *                           quantity:
 *                             type: number
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Internal Server Error
 *       400:
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 */
router.get(
  '/:recipeId',
  authenticateJWT,
  [param('recipeId').isUUID().withMessage('Invalid recipeId, it should be a UUID')],
  validationErrors,
  readRecipe,
);

/**
 * @swagger
 * /api/recipes/{recipe_id}:
 *  patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Update an existing recipe
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: recipe_id
 *         in: path
 *         required: true
 *         description: ID of the recipe to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               products:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *     responses:
 *       200:
 *         description: Recipe updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/:recipeId',
  authenticateJWT,
  [
    param('recipeId').isUUID().withMessage('Invalid Recipe ID'),
    check('title').optional().isString().isLength({ min: 1 }).withMessage('Title must be a non-empty string'),
    check('products').optional().isArray().withMessage('Products must be an array'),
    check('products.*.product_id').isUUID().withMessage('Each product ID must be a valid UUID'),
    check('products.*.quantity').isFloat({ gt: 0 }).withMessage('Each product quantity must be greater than zero'),
  ],
  validationErrors,
  updateRecipe,
);

/**
 * @swagger
 * /api/recipes/{recipeId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     description: Delete a recipe
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: recipeId
 *         in: path
 *         required: true
 *         description: ID of the recipe to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe successfully deleted
 *       403:
 *         description: Unauthorized or the recipe does not belong to the user
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:recipeId', authenticateJWT, [param('recipeId').isUUID().withMessage('Invalid Recipe ID')], validationErrors, deleteRecipe);

/**
 * @swagger
 * /api/recipes/by-product/{productId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     description: Get recipes that include a specific product
 *     tags:
 *       - Recipes
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: UUID of the product
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: cursor
 *         in: query
 *         required: false
 *         description: Cursor for pagination
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Limit for pagination
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     hasNextPage:
 *                       type: boolean
 *                     newCursor:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Validation errors or Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get(
  '/by-product/:productId',
  authenticateJWT,
  [
    check('productId').isUUID().withMessage('Invalid UUID format for productId'),
    check('cursor').optional().isUUID().withMessage('Invalid UUID format for cursor'),
    check('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  ],
  validationErrors,
  recipesByProduct,
);

export default router;
