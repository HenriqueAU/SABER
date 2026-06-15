import { IsEnum, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
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
  @IsString()
  titulo!: string;

  @ApiProperty({ description: 'Autor', example: 'J.R.R. Tolkien' })
  @IsString()
  autor!: string;

  @ApiPropertyOptional({
    description: 'Código ISBN',
    example: '978-3-16-148410-0',
  })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional({ example: 'HarperCollins' })
  @IsString()
  @IsOptional()
  editora?: string;

  @ApiPropertyOptional({ example: 1954 })
  @IsInt()
  @IsOptional()
  ano_publicacao?: number;

  @ApiPropertyOptional({ description: 'Resumo do livro' })
  @IsString()
  @IsOptional()
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
