import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExtensions1732800000000 implements MigrationInterface {
  name = 'CreateExtensions1732800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
  }

  public async down(): Promise<void> {
    // Extensions are left in place intentionally; dropping them could break other schemas.
  }
}
