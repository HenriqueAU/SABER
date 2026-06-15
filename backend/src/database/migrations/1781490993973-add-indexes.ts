/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1781490993973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX idx_email ON usuario (email)`)
        await queryRunner.query(`CREATE INDEX idx_instituicao_id_usuario ON usuario (instituicao_id)`)
        await queryRunner.query(`CREATE INDEX idx_instituicao_id_livro ON livro (instituicao_id)`)
        await queryRunner.query(`CREATE INDEX idx_livro_id ON exemplar (livro_id)`)
        await queryRunner.query(`CREATE INDEX idx_usuario_id ON emprestimo (usuario_id)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_email`)
        await queryRunner.query(`DROP INDEX idx_instituicao_id_usuario`)
        await queryRunner.query(`DROP INDEX idx_instituicao_id_livro`)
        await queryRunner.query(`DROP INDEX idx_livro_id`)
        await queryRunner.query(`DROP INDEX idx_usuario_id`)
    }
}
