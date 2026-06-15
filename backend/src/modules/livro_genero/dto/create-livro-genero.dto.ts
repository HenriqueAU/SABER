import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLivroGeneroDto {
  @ApiProperty({ description: 'ID do livro', example: 'uuid-do-livro' })
  @IsUUID()
  livro_id!: string;

  @ApiProperty({
    description: 'ID do gênero literário',
    example: 'uuid-do-genero',
  })
  @IsUUID()
  genero_id!: string;
}
