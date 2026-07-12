import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaginasLivro1783866789852 implements MigrationInterface {
    name = 'AddPaginasLivro1783866789852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_email"`);
        await queryRunner.query(`DROP INDEX "public"."idx_instituicao_id_usuario"`);
        await queryRunner.query(`DROP INDEX "public"."idx_instituicao_id_livro"`);
        await queryRunner.query(`DROP INDEX "public"."idx_livro_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_usuario_id"`);
        await queryRunner.query(`ALTER TABLE "livro" ADD "paginas" integer`);
        await queryRunner.query(`ALTER TABLE "notificacao" DROP COLUMN "data"`);
        await queryRunner.query(`ALTER TABLE "notificacao" ADD "data" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notificacao" DROP COLUMN "data"`);
        await queryRunner.query(`ALTER TABLE "notificacao" ADD "data" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "livro" DROP COLUMN "paginas"`);
        await queryRunner.query(`CREATE INDEX "idx_usuario_id" ON "emprestimo" ("usuario_id") `);
        await queryRunner.query(`CREATE INDEX "idx_livro_id" ON "exemplar" ("livro_id") `);
        await queryRunner.query(`CREATE INDEX "idx_instituicao_id_livro" ON "livro" ("instituicao_id") `);
        await queryRunner.query(`CREATE INDEX "idx_instituicao_id_usuario" ON "usuario" ("instituicao_id") `);
        await queryRunner.query(`CREATE INDEX "idx_email" ON "usuario" ("email") `);
    }

}
