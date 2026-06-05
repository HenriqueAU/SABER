/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoInstituicao } from '../instituicao.entity';

export class CreateInstituicaoDto {
  @IsString()
  nome!: string;

  @IsEnum(TipoInstituicao)
  tipo!: TipoInstituicao;

  @IsString()
  @IsOptional()
  cidade?: string;

  @IsString()
  @IsOptional()
  estado?: string;
}
