import { PartialType } from '@nestjs/mapped-types';
import { CreateExemplarDto } from './create-exemplar.dto';

export class UpdateExemplarDto extends PartialType(CreateExemplarDto) {}
