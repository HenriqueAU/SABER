import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { TipoInstituicao } from '../instituicao.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInstituicaoDto {
  @ApiProperty({
    description: 'Nome da instituição',
    example: 'Escola Estadual Exemplo',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  nome!: string;

  @ApiProperty({ description: 'Tipo de instituição', enum: TipoInstituicao })
  @IsNotEmpty()
  @IsEnum(TipoInstituicao)
  tipo!: TipoInstituicao;

  @ApiProperty({
    description: 'Cidade onde se localiza a instituição',
    example: 'Anápolis',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  cidade?: string;

  @ApiProperty({
    description: 'Estado onde se localiza a instituição',
    example: 'Goiás',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  estado?: string;
}
