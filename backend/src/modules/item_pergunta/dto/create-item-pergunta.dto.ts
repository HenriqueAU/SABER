import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateItemPerguntaDto {
  @ApiProperty({
    description: 'ID da pergunta relacionada',
    example: 'de81b0ba-8ae7-4fd3-94ab-7ae3f25cf84b',
  })
  @IsUUID()
  @IsNotEmpty()
  pergunta_id!: string;

  @ApiProperty({
    description: 'Texto do item da pergunta',
    example: 'Qual foi sua parte favorita do livro?',
  })
  @IsString()
  @IsNotEmpty()
  texto!: string;
}
