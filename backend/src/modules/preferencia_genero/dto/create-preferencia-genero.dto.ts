import { IsUUID } from 'class-validator';

export class CreatePreferenciaGeneroDto {
  @IsUUID()
  usuario_id!: string;

  @IsUUID()
  genero_id!: string;
}
