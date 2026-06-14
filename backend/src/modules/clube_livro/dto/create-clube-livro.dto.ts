import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClubeLivroDto {

  @ApiProperty({
    description: 'ID do professor responsável pelo clube',
    example: 'de81b0ba-8ae7-4fd3-94ab-7ae3f25cf84b'})
  @IsUUID()
  @IsNotEmpty()
  professor_id!: string;

 @ApiProperty({
    description: 'ID do livro do clube',
    example: 'de81b0ba-8ae7-4fd3-94ab-7ae3f25cf84b'}) 
  @IsUUID()
  @IsNotEmpty()
  livro_id!: string;

  @ApiProperty({
    description: 'Nome do clube',
    example: 'Clube da meia noite'}) 
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({
    description: 'Data de início do clube',
    example: '2026-08-01',
    required: false})
  @IsDateString()
  @IsOptional()
  data_inicio?: Date | null;

  @ApiProperty({
    description: 'Data de termino do clube',
    example: '2026-12-01',
  required: false})
  @IsDateString()
  @IsOptional()
  data_fim?: Date | null;

  @ApiProperty({
    description: 'local ou link de encontro',
    example: 'link do Meet',
    required: false
})
  @IsString()
  @IsOptional()
  local_encontro?: string | null;
}
