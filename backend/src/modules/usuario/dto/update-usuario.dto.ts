import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateUsuarioDto {
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
  @IsOptional()
  @IsDateString()
  data_nasc?: Date;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(150)
  @Matches(/^[A-Za-zÀ-ÿ' -]+$/, {
    message: 'Nome contém caracteres inválidos',
  })
  nome?: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha123!',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/, {
    message:
      'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial',
  })
  senha?: string;
}
