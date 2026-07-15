import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationInicial1784085561695 implements MigrationInterface {
  name = 'MigrationInicial1784085561695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_email"`);
    await queryRunner.query(`DROP INDEX "public"."idx_instituicao_id_usuario"`);
    await queryRunner.query(`DROP INDEX "public"."idx_instituicao_id_livro"`);
    await queryRunner.query(`DROP INDEX "public"."idx_livro_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_usuario_id"`);
    await queryRunner.query(
      `CREATE TYPE "public"."emprestimo_status_enum" AS ENUM('ativo', 'devolvido', 'perdido', 'danificado')`,
    );
    await queryRunner.query(
      `ALTER TABLE "emprestimo" ADD "status" "public"."emprestimo_status_enum" NOT NULL DEFAULT 'ativo'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exemplar" ALTER COLUMN "status" SET DEFAULT 'disponivel'`,
    );
    await queryRunner.query(`ALTER TABLE "notificacao" DROP COLUMN "data"`);
    await queryRunner.query(
      `ALTER TABLE "notificacao" ADD "data" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notificacao" DROP COLUMN "data"`);
    await queryRunner.query(
      `ALTER TABLE "notificacao" ADD "data" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "exemplar" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "emprestimo" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."emprestimo_status_enum"`);
    await queryRunner.query(
      `CREATE INDEX "idx_usuario_id" ON "emprestimo" ("usuario_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_livro_id" ON "exemplar" ("livro_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_instituicao_id_livro" ON "livro" ("instituicao_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_instituicao_id_usuario" ON "usuario" ("instituicao_id") `,
    );
    await queryRunner.query(`CREATE INDEX "idx_email" ON "usuario" ("email") `);
  }
}
