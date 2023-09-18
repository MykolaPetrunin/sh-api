import { Sequelize } from 'sequelize';
import 'dotenv/config';

const { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT, ENV } = process.env;

if (!PGUSER || !PGPASSWORD || !PGDATABASE || !PGHOST || !PGPORT || !ENV) {
  throw new Error('Database configuration variables are missing');
}
export const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
  host: PGHOST,
  port: Number(PGPORT),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: ENV === 'prod',
    },
  },
  dialect: 'postgres',
  logging: false,
});
