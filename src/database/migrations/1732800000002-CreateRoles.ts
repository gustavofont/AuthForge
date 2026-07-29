import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateRoles1732800000002 implements MigrationInterface {
  name = 'CreateRoles1732800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'varchar', length: '255', isNullable: true },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({ name: 'IDX_ROLES_NAME', columnNames: ['name'], isUnique: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles');
  }
}
