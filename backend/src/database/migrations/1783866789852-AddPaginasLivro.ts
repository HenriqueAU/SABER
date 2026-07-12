import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaginasLivro1783866789852 implements MigrationInterface {
    name = 'AddPaginasLivro1783866789852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "livro" ADD "paginas" integer`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "livro" DROP COLUMN "paginas"`);
    }

}
