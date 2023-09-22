import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createExtension('pg_trgm', { ifNotExists: true });

  pgm.createTable('recipes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    title: {
      type: 'varchar(50)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: false,
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.sql(`
    CREATE INDEX idx_recipes_title_gin
    ON products
    USING gin (title gin_trgm_ops);
  `);

  pgm.createConstraint('recipes', 'unique_recipe_combination', {
    unique: ['user_id', 'title'],
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_recipes_title_gin;
  `);
  pgm.dropConstraint('recipes', 'unique_recipe_combination');
  pgm.dropTable('recipes');
}
