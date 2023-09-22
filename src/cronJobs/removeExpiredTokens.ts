import EmailVerificationToken from '../models/EmailVerificationToken';
import { Op } from 'sequelize';
import User from '../models/User';
import { sequelize } from '../config/sequelize';

export const removeExpiredTokens = async () => {
  const transaction = await sequelize.transaction();

  try {
    const expiredTokens = await EmailVerificationToken.findAll({
      where: {
        expires_at: {
          [Op.lt]: new Date(),
        },
      },
      transaction,
    });

    for (const token of expiredTokens) {
      const userId = token.get('user_id');

      await User.destroy({ where: { id: userId }, transaction });
      await EmailVerificationToken.destroy({ where: { id: token.get('id') }, transaction });
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    console.error('Failed to delete expired tokens and users:', error);
  }
};
