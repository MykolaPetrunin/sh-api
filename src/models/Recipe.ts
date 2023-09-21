import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';
import Product from './Product';

class Recipe extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public user_id!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  products?: Product[];
}

Recipe.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: DataTypes.STRING(50),
    description: DataTypes.TEXT,
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'recipes',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default Recipe;
