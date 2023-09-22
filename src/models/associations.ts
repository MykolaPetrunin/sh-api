import Recipe from './Recipe';
import Product from './Product';
import RecipeProduct from './RecipeProduct';
import Token from './Token';
import User from './User';
import EmailVerificationToken from './EmailVerificationToken';

User.hasMany(Recipe, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Recipe.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(EmailVerificationToken, { foreignKey: 'user_id' });
EmailVerificationToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Product, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Token, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Token.belongsTo(User, { foreignKey: 'user_id' });

Recipe.belongsToMany(Product, {
  through: RecipeProduct,
  foreignKey: 'recipe_id',
  otherKey: 'product_id',
  as: 'products',
});

Product.belongsToMany(Recipe, {
  through: RecipeProduct,
  foreignKey: 'product_id',
  otherKey: 'recipe_id',
  as: 'recipes',
});

RecipeProduct.belongsTo(Recipe, { foreignKey: 'recipe_id' });
RecipeProduct.belongsTo(Product, { foreignKey: 'product_id' });
