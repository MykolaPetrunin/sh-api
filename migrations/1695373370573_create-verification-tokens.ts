import { MigrationBuilder } from 'node-pg-migrate';

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('email_verification_tokens', {
    user_id: {
      type: 'uuid',
      notNull: true,
      references: 'users(id)',
    },
    token: {
      type: 'text',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    expires_at: {
      type: 'timestamp',
      notNull: true,
    },
  });

  pgm.addConstraint('email_verification_tokens', 'pk_email_verification_tokens', {
    primaryKey: ['user_id', 'token'],
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('email_verification_tokens');
}
