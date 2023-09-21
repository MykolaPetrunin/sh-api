import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';

class RecipeProduct extends Model {
  public recipe_id!: string;
  public product_id!: string;
  public quantity!: number;
}

RecipeProduct.init(
  {
    recipe_id: {
      type: DataTypes.UUID,
      references: {
        model: 'recipes',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    quantity: DataTypes.REAL,
  },
  {
    sequelize,
    tableName: 'recipe_product',
    underscored: true,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  },
);

export default RecipeProduct;
