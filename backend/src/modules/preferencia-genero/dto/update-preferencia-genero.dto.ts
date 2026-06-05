import { PartialType } from '@nestjs/mapped-types';
import { CreatePreferenciaGeneroDto } from './create-preferencia-genero.dto';

export class UpdatePreferenciaGeneroDto extends PartialType(
  CreatePreferenciaGeneroDto,
) {}
