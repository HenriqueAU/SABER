import { PartialType } from '@nestjs/swagger';
import { CreateExemplarDto } from './create-exemplar.dto';

export class UpdateExemplarDto extends PartialType(CreateExemplarDto) {}
