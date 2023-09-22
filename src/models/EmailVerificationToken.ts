import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/sequelize';

class EmailVerificationToken extends Model {
  public user_id!: string;
  public token!: string;
  public readonly created_at!: Date;
  public expires_at!: Date;
}

EmailVerificationToken.init(
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'email_verification_tokens',
    sequelize,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

export default EmailVerificationToken;
