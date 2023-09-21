import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('recipe_product', {
    recipe_id: {
      type: 'uuid',
      notNull: true,
      references: 'recipes(id)',
      onDelete: 'CASCADE',
    },
    product_id: {
      type: 'uuid',
      notNull: true,
      references: 'products(id)',
      onDelete: 'CASCADE',
    },
    quantity: {
      type: 'real',
      notNull: true,
    },
  });

  pgm.addConstraint('recipe_product', 'primary_key_recipe_product', 'PRIMARY KEY (product_id, recipe_id)');
  pgm.addConstraint('recipe_product', 'check_quantity', 'CHECK (quantity > 0)');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropConstraint('recipe_product', 'check_quantity');
  pgm.dropConstraint('recipe_product', 'primary_key_recipe_product');
  pgm.dropTable('recipe_product');
}
