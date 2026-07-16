import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationInicial1784085561695 implements MigrationInterface {
  name = 'MigrationInicial1784085561695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."emprestimo_status_enum" AS ENUM('ativo', 'devolvido', 'perdido', 'danificado')`,
    );
    await queryRunner.query(
      `ALTER TABLE "emprestimo" ADD "status" "public"."emprestimo_status_enum" NOT NULL DEFAULT 'ativo'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exemplar" ALTER COLUMN "status" SET DEFAULT 'disponivel'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exemplar" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "emprestimo" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."emprestimo_status_enum"`);
  }
}
