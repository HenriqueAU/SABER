import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiProperty({
    description: 'Foto de perfil do usuário',
    example: 'url-generica-de-api.com',
  })
  @IsString()
  @IsOptional()
  foto_perfil?: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João da Silva',
  })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário',
    example: '2003-12-25',
  })
  @IsDateString()
  @IsOptional()
  data_nasc?: Date;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha123!',
  })
  @IsString()
  @IsOptional()
  senha?: string;
}
