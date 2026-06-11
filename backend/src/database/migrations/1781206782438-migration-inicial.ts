/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationInicial1781206782438 implements MigrationInterface {
    name = 'MigrationInicial1781206782438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."instituicao_tipo_enum" AS ENUM('escola', 'faculdade')`);
        await queryRunner.query(`CREATE TABLE "instituicao" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "tipo" "public"."instituicao_tipo_enum" NOT NULL, "cidade" text, "estado" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1e9c5da0b1d623b4056fa98e43a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_perfil_enum" AS ENUM('gestor', 'bibliotecario', 'professor', 'aluno')`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data_nasc" date NOT NULL, "foto_perfil" character varying, "nome" character varying NOT NULL, "email" character varying NOT NULL, "senha_hash" character varying NOT NULL, "perfil" "public"."usuario_perfil_enum" NOT NULL, "ativo" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "instituicao_id" uuid, CONSTRAINT "UQ_2863682842e688ca198eb25c124" UNIQUE ("email"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."livro_faixa_etaria_enum" AS ENUM('livre', '10+', '12+', '14+', '16+', '18+')`);
        await queryRunner.query(`CREATE TABLE "livro" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "titulo" character varying NOT NULL, "autor" character varying NOT NULL, "isbn" character varying, "editora" character varying, "ano_publicacao" integer, "sinopse" text, "capa_url" character varying, "faixa_etaria" "public"."livro_faixa_etaria_enum", "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "instituicao_id" uuid, CONSTRAINT "UQ_6a96e9eca146591b204afed46b2" UNIQUE ("isbn"), CONSTRAINT "PK_5601163ea69da49108c4f7854cf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "clube_livro" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "ativo" boolean NOT NULL DEFAULT true, "data_inicio" TIMESTAMP WITH TIME ZONE, "data_fim" TIMESTAMP WITH TIME ZONE, "local_encontro" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "professor_id" uuid, "livro_id" uuid, CONSTRAINT "PK_fc746a4b9b30a0ac5d754c81a8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."exemplar_status_enum" AS ENUM('disponivel', 'emprestado', 'danificado', 'perdido')`);
        await queryRunner.query(`CREATE TABLE "exemplar" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codigo" character varying NOT NULL, "status" "public"."exemplar_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "livro_id" uuid, CONSTRAINT "UQ_1e84e4146f1a77fc0cb78c8228d" UNIQUE ("codigo"), CONSTRAINT "PK_99bb0536a8ba1ef4569d9fa077e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "emprestimo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "data_retirada" TIMESTAMP WITH TIME ZONE NOT NULL, "data_devolucao_esperada" TIMESTAMP WITH TIME ZONE NOT NULL, "data_devolucao_efetiva" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "exemplar_id" uuid, "usuario_id" uuid, CONSTRAINT "PK_d8f9a723b1f2fd57102a5c424f8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "genero" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_756b4e7aa3a88d1fb51ceedfa32" UNIQUE ("nome"), CONSTRAINT "PK_681c2c8d602304f33f9cc74e6ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pergunta" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "texto" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cd3254fbdc5b83baebe96a3c48e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "item_pergunta" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "texto" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "pergunta_id" uuid, CONSTRAINT "PK_43dc4f8d56bbbdff210dba664a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."membro_clube_status_enum" AS ENUM('pendente', 'confirmado', 'cancelado', 'finalizado')`);
        await queryRunner.query(`CREATE TABLE "membro_clube" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."membro_clube_status_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "clube_id" uuid, "usuario_id" uuid, CONSTRAINT "PK_0353303f032015be756bb55050c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "preferencia_genero" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "usuario_id" uuid, "genero_id" uuid, CONSTRAINT "PK_4e019b694775d32a6f9a1e44506" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "resposta_membro" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "membro_clube_id" uuid, "item_pergunta_id" uuid, CONSTRAINT "PK_b83e8b6a98e57cfef1e2d47c9e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "livro_genero" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "livro_id" uuid, "genero_id" uuid, CONSTRAINT "PK_f9657cbd62ab73cc93bba6f8017" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "FK_1b86ad3ce92ffc2e5e07b7edbc1" FOREIGN KEY ("instituicao_id") REFERENCES "instituicao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "livro" ADD CONSTRAINT "FK_23e7491f0b636bbd9d4f6ca3a36" FOREIGN KEY ("instituicao_id") REFERENCES "instituicao"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clube_livro" ADD CONSTRAINT "FK_34687365df5775a093ffe156faf" FOREIGN KEY ("professor_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clube_livro" ADD CONSTRAINT "FK_2e1187bf2b82ae860702ab38244" FOREIGN KEY ("livro_id") REFERENCES "livro"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exemplar" ADD CONSTRAINT "FK_db4811add2fbb912c3e7cf9391c" FOREIGN KEY ("livro_id") REFERENCES "livro"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emprestimo" ADD CONSTRAINT "FK_3464b9e316b8f2c1db21d189e7e" FOREIGN KEY ("exemplar_id") REFERENCES "exemplar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emprestimo" ADD CONSTRAINT "FK_27a9ba3b76a3943dc873b248558" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_pergunta" ADD CONSTRAINT "FK_c95692051846ccf36848ce5e6fe" FOREIGN KEY ("pergunta_id") REFERENCES "pergunta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membro_clube" ADD CONSTRAINT "FK_57b7f7168246ee273551b826409" FOREIGN KEY ("clube_id") REFERENCES "clube_livro"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membro_clube" ADD CONSTRAINT "FK_d5560241afc18a8eb353411fa28" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "preferencia_genero" ADD CONSTRAINT "FK_46ac32cb987cbbea59e7ceb0e33" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "preferencia_genero" ADD CONSTRAINT "FK_b20c840076b298ac905a9b7aeb5" FOREIGN KEY ("genero_id") REFERENCES "genero"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resposta_membro" ADD CONSTRAINT "FK_711068fd6a7b6486fb4d580ebdf" FOREIGN KEY ("membro_clube_id") REFERENCES "membro_clube"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resposta_membro" ADD CONSTRAINT "FK_abd19003c4c8fc5685aad387374" FOREIGN KEY ("item_pergunta_id") REFERENCES "item_pergunta"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "livro_genero" ADD CONSTRAINT "FK_cc970104052cec9897374cb5cbe" FOREIGN KEY ("livro_id") REFERENCES "livro"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "livro_genero" ADD CONSTRAINT "FK_d04fe1697626302d2c8df31465a" FOREIGN KEY ("genero_id") REFERENCES "genero"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "livro_genero" DROP CONSTRAINT "FK_d04fe1697626302d2c8df31465a"`);
        await queryRunner.query(`ALTER TABLE "livro_genero" DROP CONSTRAINT "FK_cc970104052cec9897374cb5cbe"`);
        await queryRunner.query(`ALTER TABLE "resposta_membro" DROP CONSTRAINT "FK_abd19003c4c8fc5685aad387374"`);
        await queryRunner.query(`ALTER TABLE "resposta_membro" DROP CONSTRAINT "FK_711068fd6a7b6486fb4d580ebdf"`);
        await queryRunner.query(`ALTER TABLE "preferencia_genero" DROP CONSTRAINT "FK_b20c840076b298ac905a9b7aeb5"`);
        await queryRunner.query(`ALTER TABLE "preferencia_genero" DROP CONSTRAINT "FK_46ac32cb987cbbea59e7ceb0e33"`);
        await queryRunner.query(`ALTER TABLE "membro_clube" DROP CONSTRAINT "FK_d5560241afc18a8eb353411fa28"`);
        await queryRunner.query(`ALTER TABLE "membro_clube" DROP CONSTRAINT "FK_57b7f7168246ee273551b826409"`);
        await queryRunner.query(`ALTER TABLE "item_pergunta" DROP CONSTRAINT "FK_c95692051846ccf36848ce5e6fe"`);
        await queryRunner.query(`ALTER TABLE "emprestimo" DROP CONSTRAINT "FK_27a9ba3b76a3943dc873b248558"`);
        await queryRunner.query(`ALTER TABLE "emprestimo" DROP CONSTRAINT "FK_3464b9e316b8f2c1db21d189e7e"`);
        await queryRunner.query(`ALTER TABLE "exemplar" DROP CONSTRAINT "FK_db4811add2fbb912c3e7cf9391c"`);
        await queryRunner.query(`ALTER TABLE "clube_livro" DROP CONSTRAINT "FK_2e1187bf2b82ae860702ab38244"`);
        await queryRunner.query(`ALTER TABLE "clube_livro" DROP CONSTRAINT "FK_34687365df5775a093ffe156faf"`);
        await queryRunner.query(`ALTER TABLE "livro" DROP CONSTRAINT "FK_23e7491f0b636bbd9d4f6ca3a36"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "FK_1b86ad3ce92ffc2e5e07b7edbc1"`);
        await queryRunner.query(`DROP TABLE "livro_genero"`);
        await queryRunner.query(`DROP TABLE "resposta_membro"`);
        await queryRunner.query(`DROP TABLE "preferencia_genero"`);
        await queryRunner.query(`DROP TABLE "membro_clube"`);
        await queryRunner.query(`DROP TYPE "public"."membro_clube_status_enum"`);
        await queryRunner.query(`DROP TABLE "item_pergunta"`);
        await queryRunner.query(`DROP TABLE "pergunta"`);
        await queryRunner.query(`DROP TABLE "genero"`);
        await queryRunner.query(`DROP TABLE "emprestimo"`);
        await queryRunner.query(`DROP TABLE "exemplar"`);
        await queryRunner.query(`DROP TYPE "public"."exemplar_status_enum"`);
        await queryRunner.query(`DROP TABLE "clube_livro"`);
        await queryRunner.query(`DROP TABLE "livro"`);
        await queryRunner.query(`DROP TYPE "public"."livro_faixa_etaria_enum"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_perfil_enum"`);
        await queryRunner.query(`DROP TABLE "instituicao"`);
        await queryRunner.query(`DROP TYPE "public"."instituicao_tipo_enum"`);
    }

}
