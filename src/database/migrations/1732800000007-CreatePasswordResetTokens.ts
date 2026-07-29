import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreatePasswordResetTokens1732800000007 implements MigrationInterface {
  name = 'CreatePasswordResetTokens1732800000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'password_reset_tokens',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'token_hash', type: 'varchar', length: '255' },
          { name: 'expires_at', type: 'timestamptz' },
          { name: 'used_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createIndex(
      'password_reset_tokens',
      new TableIndex({ name: 'IDX_PASSWORD_RESET_TOKENS_USER_ID', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'password_reset_tokens',
      new TableIndex({ name: 'IDX_PASSWORD_RESET_TOKENS_TOKEN_HASH', columnNames: ['token_hash'] }),
    );

    await queryRunner.createForeignKey(
      'password_reset_tokens',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('password_reset_tokens');
  }
}
