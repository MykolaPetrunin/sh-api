import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createExtension('pg_trgm', { ifNotExists: true });

  pgm.createTable('products', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    proteins: {
      type: 'real',
      notNull: true,
    },
    carbohydrates: {
      type: 'real',
      notNull: true,
    },
    fats: {
      type: 'real',
      notNull: true,
    },
    title: {
      type: 'varchar(50)',
      notNull: true,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    barcode: {
      type: 'varchar(20)',
      notNull: false,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updatedAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.sql(`
    CREATE INDEX idx_products_title_gin
    ON products
    USING gin (title gin_trgm_ops);
  `);

  pgm.createConstraint('products', 'unique_product_combination', {
    unique: ['proteins', 'carbohydrates', 'fats', 'title'],
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_products_title_gin;
  `);
  pgm.dropConstraint('products', 'unique_product_combination');
  pgm.dropTable('products');
}
