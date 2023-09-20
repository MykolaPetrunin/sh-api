import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';

const caloriesInFat = 9;
const caloriesInCarbohydrates = 4;
const caloriesInProteins = 4;

class Product extends Model {
  public readonly id!: string;
  public proteins!: number;
  public carbohydrates!: number;
  public fats!: number;
  public title!: string;
  public readonly user_id!: string;
  public barcode?: string;
  public description?: string;
  public calories?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  calculateCalories() {
    const { fats, carbohydrates, proteins } = this.get();
    return fats * caloriesInFat + carbohydrates * caloriesInCarbohydrates + proteins * caloriesInProteins;
  }
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    proteins: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    carbohydrates: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    fats: {
      type: DataTypes.REAL,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING(20),
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    tableName: 'products',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

Product.addHook('beforeFind', (options) => {
  if (!options.attributes) {
    options.attributes = { include: [] };
  }

  if (typeof options.attributes === 'object' && !Array.isArray(options.attributes)) {
    if (!options.attributes.include) {
      options.attributes.include = [];
    }
    options.attributes.include.push([
      sequelize.literal(`(fats * ${caloriesInFat}) + (carbohydrates * ${caloriesInCarbohydrates}) + (proteins * ${caloriesInProteins})`),
      'calories',
    ]);
  } else if (Array.isArray(options.attributes)) {
    options.attributes.push([
      sequelize.literal(`(fats * ${caloriesInFat}) + (carbohydrates * ${caloriesInCarbohydrates}) + (proteins * ${caloriesInProteins})`),
      'calories',
    ]);
  }
});

Product.addHook('afterCreate', (instance: Product) => {
  instance.setDataValue('calories', instance.calculateCalories());
});

Product.addHook('afterUpdate', (instance: Product) => {
  instance.setDataValue('calories', instance.calculateCalories());
});

export default Product;
