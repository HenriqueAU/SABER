import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoInstituicao } from '../instituicao.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInstituicaoDto {
  @ApiProperty({
    description: 'Nome da instituição',
    example: 'Escola Estadual Exemplo',
  })
  @IsString()
  nome!: string;

  @ApiProperty({ description: 'Tipo de instituição', enum: TipoInstituicao })
  @IsEnum(TipoInstituicao)
  tipo!: TipoInstituicao;

  @ApiProperty({
    description: 'Cidade onde se localiza a instituição',
    example: 'Anápolis',
  })
  @IsString()
  @IsOptional()
  cidade?: string;

  @ApiProperty({
    description: 'Estado onde se localiza a instituição',
    example: 'Goiás',
  })
  @IsString()
  @IsOptional()
  estado?: string;
}
