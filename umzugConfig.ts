import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './src/config/sequelize';

export const umzug = new Umzug({
  migrations: { glob: './migrations/*.ts' },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});
