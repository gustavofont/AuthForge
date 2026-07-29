import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePermissions1732800000003 implements MigrationInterface {
  name = 'CreatePermissions1732800000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createIndex(
      'permissions',
      new TableIndex({ name: 'IDX_PERMISSIONS_NAME', columnNames: ['name'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('permissions');
  }
}
