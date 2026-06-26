import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificacao1782443562821 implements MigrationInterface {
    name = 'CreateNotificacao1782443562821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notificacao" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying NOT NULL, "mensagem" text NOT NULL, "data" TIMESTAMP NOT NULL DEFAULT now(), "lida" boolean NOT NULL DEFAULT false, "usuario_id" uuid NOT NULL, CONSTRAINT "PK_d00eecdb1cf82cafac9e637dbe4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notificacao" ADD CONSTRAINT "FK_b0a05cab28eb2cf81d6c9a0838e" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notificacao" DROP CONSTRAINT "FK_b0a05cab28eb2cf81d6c9a0838e"`);
        await queryRunner.query(`DROP TABLE "notificacao"`);
    }
}
