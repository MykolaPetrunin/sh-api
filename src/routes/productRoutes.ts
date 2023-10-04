import express from 'express';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { body, check, param, query } from 'express-validator';
import { readProduct } from '../controllers/products/readProduct';
import { deleteProduct } from '../controllers/products/deleteProduct';
import { createProduct } from '../controllers/products/createProduct';
import { updateProduct } from '../controllers/products/updateProduct';
import { allProducts } from '../controllers/products/allProducts';
import { validationErrors } from '../middlewares/validationErrors';
import { createProductFromRecipe } from '../controllers/products/createProductFromRecipe';

const router = express.Router();

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
 *         description: Number of products to return (default is 10, min 1, max 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *       - name: cursor
 *         in: query
 *         required: false
 *         description: Cursor for pagination (UUID)
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: search
 *         in: query
 *         required: false
 *         description: Full-text search query (max length 100)
 *         schema:
 *           type: string
 *           maxLength: 100
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
 *       400:
 *         description: Validation Error
 *       500:
 *         description: Internal Server Error
 */
router.get(
  '/',
  authenticateJWT,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit should be an integer between 1 and 100'),
    query('cursor').optional().isUUID().withMessage('Cursor should be a valid UUID'),
    query('search')
      .optional()
      .isString()
      .isLength({ max: 100 })
      .withMessage('Search text should be a string with a maximum length of 100 characters'),
  ],
  validationErrors,
  allProducts,
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     description: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proteins
 *               - carbohydrates
 *               - fats
 *               - title
 *             properties:
 *               proteins:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Proteins must be a positive number
 *               carbohydrates:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Carbohydrates must be a positive number
 *               fats:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Fats must be a positive number
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Title must be between 1 and 50 characters
 *               barcode:
 *                 type: string
 *                 maxLength: 20
 *                 description: Barcode must be maximum 20 characters (optional)
 *               description:
 *                 type: string
 *                 description: Description must be a string (optional)
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Error creating product
 */
router.post(
  '/',
  authenticateJWT,
  [
    check('proteins').isFloat({ min: 0 }).withMessage('Proteins must be a positive number'),
    check('carbohydrates').isFloat({ min: 0 }).withMessage('Carbohydrates must be a positive number'),
    check('fats').isFloat({ min: 0 }).withMessage('Fats must be a positive number'),
    check('title').isLength({ min: 1, max: 50 }).withMessage('Title must be between 1 and 50 characters'),
    check('barcode').optional().isLength({ max: 20 }).withMessage('Barcode must be maximum 20 characters'),
    check('description').optional().isString().withMessage('Description must be a string'),
  ],
  createProduct,
);

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     description: Get a product
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully fetched
 *       403:
 *         description: Unauthorized or the product does not belong to the user
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:productId', authenticateJWT, [param('productId').isUUID().withMessage('Invalid Product ID')], validationErrors, readProduct);

/**
 * @swagger
 * /api/products/{productId}:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     description: Update a product
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to update
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proteins:
 *                 type: number
 *                 format: float
 *               carbohydrates:
 *                 type: number
 *                 format: float
 *               fats:
 *                 type: number
 *                 format: float
 *               title:
 *                 type: string
 *               barcode:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product successfully updated
 *       403:
 *         description: Unauthorized or the product does not belong to the user
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.patch(
  '/:productId',
  authenticateJWT,
  [
    param('productId').isString().notEmpty().withMessage('Product ID is required'),
    body('proteins').optional().isNumeric().withMessage('Proteins must be a number'),
    body('carbohydrates').optional().isNumeric().withMessage('Carbohydrates must be a number'),
    body('fats').optional().isNumeric().withMessage('Fats must be a number'),
    body('title').optional().isString().notEmpty().withMessage('Title must be a string and not empty'),
    body('barcode').optional().isString().notEmpty().withMessage('Barcode must be a string and not empty'),
    body('description').optional().isString().notEmpty().withMessage('Description must be a string and not empty'),
  ],
  validationErrors,
  updateProduct,
);

/**
 * @swagger
 * /api/products/{productId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     description: Delete a product
 *     tags:
 *       - Products
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: ID of the product to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product successfully deleted
 *       403:
 *         description: Unauthorized or the product does not belong to the user
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:productId', authenticateJWT, [param('productId').isUUID().withMessage('Invalid Product ID')], validationErrors, deleteProduct);

/**
 * @swagger
 * /api/products/create-product-from-recipe:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     description: Create a product from a recipe
 *     tags:
 *       - Products
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipeId
 *               - title
 *             properties:
 *               recipeId:
 *                 type: string
 *                 description: The ID of the recipe to base the product on
 *                 example: "1234-5678-91011"
 *               title:
 *                 type: string
 *                 description: The title of the new product
 *                 example: "New Product"
 *               description:
 *                 type: string
 *                 description: The description of the new product
 *                 example: "This is a new product based on a recipe."
 *     responses:
 *       201:
 *         description: Product successfully created
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
 *                 proteins:
 *                   type: number
 *                 fats:
 *                   type: number
 *                 carbohydrates:
 *                   type: number
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/create-product-from-recipe',
  authenticateJWT,
  [
    body('recipeId').notEmpty().withMessage('recipeId is required'),
    body('title').notEmpty().withMessage('title is required').isString().withMessage('title must be a string'),
    body('description').optional().isString().withMessage('description must be a string'), // Ось воно
    // Add more validation rules here
  ],
  createProductFromRecipe,
);

export default router;
