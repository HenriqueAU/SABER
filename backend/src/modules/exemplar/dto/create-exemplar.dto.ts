import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExemplarDto {
  @ApiProperty({ description: 'ID do livro', example: 'uuid-do-livro-aqui' })
  @IsUUID()
  livro_id!: string;

  @ApiProperty({ description: 'Código do exemplar', example: 'EX-001' })
  @IsString()
  codigo!: string;
}
