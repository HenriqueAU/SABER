import { IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateEmprestimoDto {
  @IsUUID()
  exemplar_id!: string;

  @IsUUID()
  usuario_id!: string;

  @IsDateString()
  data_retirada!: Date;

  @IsDateString()
  data_devolucao_esperada!: Date;

  @IsDateString()
  @IsOptional()
  data_devolucao_efetiva?: Date;
}
