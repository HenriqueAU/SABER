import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { StatusMembro } from '../membro-clube.entity';

export class CreateMembroClubeDto {
  @IsUUID()
  @IsNotEmpty()
  clube_id!: string;

  @IsUUID()
  @IsNotEmpty()
  usuario_id!: string;

  @IsEnum(StatusMembro)
  status!: StatusMembro;
}
