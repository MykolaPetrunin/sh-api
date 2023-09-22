import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('uuid_generate_v4()'),
    },
    username: {
      type: 'text',
      notNull: true,
    },
    password: {
      type: 'text',
      notNull: true,
    },
    email: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    is_email_verified: {
      type: 'boolean',
      notNull: true,
      default: false,
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
    INSERT INTO users (id, username, password, email)
    VALUES ('489ed895-fb78-47f5-87e3-764f6137b379', 'SugarHunter', 'password', 'mykola.petrunin@gmail.com');
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('users');
}
