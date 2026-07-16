import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateExemplarDto } from './create-exemplar.dto';
import { StatusExemplar } from '../exemplar.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateExemplarDto extends PartialType(CreateExemplarDto) {
  @ApiPropertyOptional({
    enum: StatusExemplar,
    example: StatusExemplar.DISPONIVEL,
  })
  @IsEnum(StatusExemplar)
  @IsOptional()
  status?: StatusExemplar;
}
