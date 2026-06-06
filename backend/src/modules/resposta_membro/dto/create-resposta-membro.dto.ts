import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRespostaMembroDto {
  @IsUUID()
  @IsNotEmpty()
  membro_id!: string;

  @IsUUID()
  @IsNotEmpty()
  item_pergunta_id!: string;
}
