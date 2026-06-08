import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TipoPerfil } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsUUID()
  instituicao_id!: string;

  @IsString()
  @IsOptional()
  foto_perfil?: string;

  @IsDateString()
  data_nasc!: Date;

  @IsString()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  senha!: string;

  @IsEnum(TipoPerfil)
  perfil!: TipoPerfil;
}
