import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePerguntaDto {
  @ApiProperty({
    description: 'Texto da pergunta',
    example: 'Qual foi sua parte favorita do livro?',
  })
  @IsString()
  @IsNotEmpty()
  texto!: string;
}
