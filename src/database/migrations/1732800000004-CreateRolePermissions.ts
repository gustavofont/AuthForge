import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateRolePermissions1732800000004 implements MigrationInterface {
  name = 'CreateRolePermissions1732800000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'role_id', type: 'uuid' },
          { name: 'permission_id', type: 'uuid' },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
        ],
      }),
    );

    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'IDX_ROLE_PERMISSIONS_ROLE_PERMISSION',
        columnNames: ['role_id', 'permission_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('role_permissions');
  }
}
