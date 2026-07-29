import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateSessions1732800000006 implements MigrationInterface {
  name = 'CreateSessions1732800000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'user_id', type: 'uuid' },
          { name: 'device', type: 'varchar', length: '255', isNullable: true },
          { name: 'ip', type: 'varchar', length: '64', isNullable: true },
          { name: 'refresh_token_hash', type: 'varchar', length: '255' },
          { name: 'expires_at', type: 'timestamptz' },
          { name: 'revoked_at', type: 'timestamptz', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createIndex(
      'sessions',
      new TableIndex({ name: 'IDX_SESSIONS_USER_ID', columnNames: ['user_id'] }),
    );
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({ name: 'IDX_SESSIONS_EXPIRES_AT', columnNames: ['expires_at'] }),
    );

    await queryRunner.createForeignKey(
      'sessions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('sessions');
  }
}
