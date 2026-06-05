import { IsEnum, IsString, IsUUID } from 'class-validator';
import { StatusExemplar } from '../exemplar.entity';

export class CreateExemplarDto {
  @IsUUID()
  livro_id!: string;

  @IsString()
  codigo!: string;

  @IsEnum(StatusExemplar)
  status!: StatusExemplar;
}