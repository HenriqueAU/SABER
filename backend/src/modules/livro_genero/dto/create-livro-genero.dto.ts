import { IsUUID } from 'class-validator';

export class CreateLivroGeneroDto {
  @IsUUID()
  livro_id!: string;

  @IsUUID()
  genero_id!: string;
}
