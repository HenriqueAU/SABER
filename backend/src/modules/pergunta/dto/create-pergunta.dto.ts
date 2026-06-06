import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePerguntaDto {
  @IsString()
  @IsNotEmpty()
  texto!: string;
}
