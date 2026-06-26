import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificacaoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mensagem!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  usuario_id!: string;
}