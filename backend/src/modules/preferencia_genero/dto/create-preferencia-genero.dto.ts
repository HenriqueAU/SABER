import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreatePreferenciaGeneroDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  usuario_id!: string;

  @ApiProperty({
    description: 'ID do gênero',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  genero_id!: string;
}
