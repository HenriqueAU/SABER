import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class UpdatePreferenciaGeneroDto {
  @ApiProperty({
    description: 'Lista de IDs dos gêneros selecionados pelo usuário',
    type: [String],
  })
  @IsArray()
  @IsUUID('all',{ each: true })
  generos_ids!: string[];
}