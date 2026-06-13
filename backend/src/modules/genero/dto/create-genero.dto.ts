import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateGeneroDto {
  @ApiProperty({ description: 'Nome do Gênero Literário', example: 'Ficção Científica' })
  @IsString()
  nome!: string;
}
