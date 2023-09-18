import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import User from './User';

export interface TokenAttributes {
  id: string;
  userId: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
  userAgent?: string;
}

export interface TokenCreationAttributes extends Optional<TokenAttributes, 'id'> {}

class Token extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
  public id!: string;
  public userId!: string;
  public token!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public userAgent!: string;
}

Token.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tokens',
  },
);

export default Token;
