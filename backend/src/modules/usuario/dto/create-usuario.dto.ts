import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { TipoPerfil } from '../usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'ID da instituição',
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
  @MaxLength(500)
  foto_perfil?: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário',
    example: '2003-12-25',
  })
  @IsNotEmpty()
  @IsDateString()
  data_nasc!: Date;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  @Matches(/^[A-Za-zÀ-ÿ' -]+$/, {
    message: 'Nome contém caracteres inválidos',
  })
  nome!: string;

  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario.exemplo@email.com',
  })
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha123!',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
  })
  senha!: string;

  @ApiProperty({
    description: 'Tipo de perfil do usuário',
    enum: TipoPerfil,
  })
  @IsNotEmpty()
  @IsEnum(TipoPerfil)
  perfil!: TipoPerfil;
}
