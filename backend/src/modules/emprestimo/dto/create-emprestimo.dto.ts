import { IsUUID, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmprestimoDto {
  @ApiProperty({
    description: 'ID do exemplar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  exemplar_id!: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  usuario_id!: string;

  @ApiProperty({
    description: 'Data de retirada do empréstimo',
    example: '2026-06-13T00:30:30.294Z',
  })
  @IsDateString()
  data_retirada!: Date;

  @ApiProperty({
    description: 'Data prevista para devolução',
    example: '2026-06-20T00:30:30.294Z',
  })
  @IsDateString()
  data_devolucao_esperada!: Date;

  @ApiProperty({
    description: 'Data efetiva de devolução',
    example: '2026-06-18T00:30:30.294Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  data_devolucao_efetiva?: Date;
}
