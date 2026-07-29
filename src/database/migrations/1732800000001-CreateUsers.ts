import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateUsers1732800000001 implements MigrationInterface {
  name = 'CreateUsers1732800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'email', type: 'varchar', length: '255' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'password_hash', type: 'varchar', length: '255' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'failed_login_attempts', type: 'int', default: 0 },
          { name: 'locked_until', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_USERS_EMAIL', columnNames: ['email'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
