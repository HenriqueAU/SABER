/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  foto_perfil?: string;

  @IsString()
  @IsOptional()
  senha?: string;
}
