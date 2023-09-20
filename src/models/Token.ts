import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';
import User from './User';

export interface TokenAttributes {
  id: string;
  user_id: string;
  token: string;
  created_at?: Date;
  updated_at?: Date;
  user_agent?: string;
}

export interface TokenCreationAttributes extends Optional<TokenAttributes, 'id'> {}

class Token extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
  public id!: string;
  public user_id!: string;
  public token!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public user_agent!: string;
}

Token.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
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
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'tokens',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default Token;
