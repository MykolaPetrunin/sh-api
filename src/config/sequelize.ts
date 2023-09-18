import { Sequelize } from 'sequelize';
import 'dotenv/config';

const { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT, NODE_ENV } = process.env;

if (!PGUSER || !PGPASSWORD || !PGDATABASE || !PGHOST || !PGPORT || !NODE_ENV) {
  throw new Error('Database configuration variables are missing');
}
export const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: Number(PGPORT),
  ...(NODE_ENV !== 'development'
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}),
  dialect: 'postgres',
  logging: false,
});
