import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRespostaMembroDto {
  @ApiProperty({
    description: 'ID do membro relacionado ao clube',
    example: 'de81b0ba-8ae7-4fd3-94ab-7ae3f25cf84b',
  })
  @IsUUID()
  @IsNotEmpty()
  membro_id!: string;

  @ApiProperty({
    description: 'ID do item da pergunta relacionado ao clube',
    example: 'de81b0ba-8ae7-4fd3-94ab-7ae3f25cf84b',
  })
  @IsUUID()
  @IsNotEmpty()
  item_pergunta_id!: string;
}
