/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAtivoExemplarESetDataFimNotNull1784061028295 implements MigrationInterface {
    name = 'AddAtivoExemplarESetDataFimNotNull1784061028295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exemplar" ADD "ativo" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "clube_livro" ALTER COLUMN "data_fim" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clube_livro" ALTER COLUMN "data_fim" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "exemplar" DROP COLUMN "ativo"`);
    }
}
