import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { FaixaEtaria } from '../livro.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLivroDto {
  @ApiProperty({
    description: 'ID da Instituição',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  instituicao_id!: string;

  @ApiProperty({ description: 'Título da Obra', example: 'O Senhor dos Anéis' })
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  titulo!: string;

  @ApiProperty({ description: 'Autor', example: 'J.R.R. Tolkien' })
  @IsNotEmpty()
  @MaxLength(255)
  @IsString()
  autor!: string;

  @ApiPropertyOptional({
    description: 'Código ISBN',
    example: '978-3-16-148410-0',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional({ example: 'HarperCollins' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  editora?: string;

  @ApiPropertyOptional({ example: 1954 })
  @IsInt()
  @Min(0, { message: 'Ano de publicação inválido' })
  @Max(new Date().getFullYear(), {
    message: 'Ano de publicação não pode ser no futuro',
  })
  @IsOptional()
  ano_publicacao?: number;

  @ApiPropertyOptional({ description: 'Número de páginas', example: 320 })
  @IsInt()
  @Min(1, { message: 'Número de páginas deve ser maior que zero' })
  @Max(20000, { message: 'Número de páginas inválido' })
  @IsOptional()
  paginas?: number;

  @ApiPropertyOptional({ description: 'Resumo do livro' })
  @IsString()
  @IsOptional()
  @Min(1)
  @Max(20000)
  sinopse?: string;

  @ApiPropertyOptional({ example: 'https://exemplo.com/capa.jpg' })
  @IsString()
  @IsOptional()
  capa_url?: string;

  @ApiPropertyOptional({ enum: FaixaEtaria, example: FaixaEtaria.DEZ_MAIS })
  @IsEnum(FaixaEtaria)
  @IsOptional()
  faixa_etaria?: FaixaEtaria;
}
