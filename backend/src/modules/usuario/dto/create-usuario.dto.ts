import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TipoPerfil } from '../usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'ÍD da instituição',
    example: '0a4447f6-4afb-4b35-abaa-afacf205a7dc',
  })
  @IsUUID()
  instituicao_id!: string;

  @ApiProperty({
    description: 'Foto de perfil do usuário',
    example: 'url-generica-de-api.com',
  })
  @IsString()
  @IsOptional()
  foto_perfil?: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário',
    example: '2003-12-25',
  })
  @IsDateString()
  data_nasc!: Date;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
  @IsString()
  nome!: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario.exemplo@email.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha123!',
  })
  @IsString()
  senha!: string;

  @ApiProperty({
    description: 'Tipo de perfil do usuário',
    enum: TipoPerfil,
  })
  @IsEnum(TipoPerfil)
  perfil!: TipoPerfil;
}
