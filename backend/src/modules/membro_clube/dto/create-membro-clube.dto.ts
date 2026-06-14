import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { StatusMembro } from '../membro-clube.entity';

export class CreateMembroClubeDto {

  @ApiProperty({
    description: 'ID do clube do livro relacionado',
    example: 'de81b0ba-8ae7-4fd3-94ab-7ae3f25cf84b'})
  @IsUUID()
  @IsNotEmpty()
  clube_id!: string;

  @ApiProperty({
    description: 'ID do usuário relacionado',
    example: 'de81b0ba-8ae7-4fd3-94ab-7ae3f25cf84b'})
  @IsUUID()
  @IsNotEmpty()
  usuario_id!: string;
  
  @ApiProperty({
    description: 'Status do membro no clube',
    enum: StatusMembro,
    example: StatusMembro.PENDENTE})
  @IsEnum(StatusMembro)
  status!: StatusMembro;
}
