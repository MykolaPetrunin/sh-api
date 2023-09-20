import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/sequelize';

export interface UserAttributes {
  id: string;
  username: string;
  password: string;
  email: string;
  readonly created_at?: Date;
  readonly updated_at?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public password!: string;
  public email!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    sequelize,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

export default User;
