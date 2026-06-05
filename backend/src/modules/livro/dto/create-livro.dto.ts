import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { FaixaEtaria } from '../livro.entity';

export class CreateLivroDto {
  @IsUUID()
  instituicao_id!: string;

  @IsString()
  titulo!: string;

  @IsString()
  autor!: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsOptional()
  editora?: string;

  @IsInt()
  @IsOptional()
  ano_publicacao?: number;

  @IsString()
  @IsOptional()
  sinopse?: string;

  @IsString()
  @IsOptional()
  capa_url?: string;

  @IsEnum(FaixaEtaria)
  @IsOptional()
  faixa_etaria?: FaixaEtaria;
}
