import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  foto_perfil?: string;

  @IsString()
  nome!: string;

  @IsDateString()
  data_nasc!: Date;

  @IsString()
  @IsOptional()
  senha?: string;
}
