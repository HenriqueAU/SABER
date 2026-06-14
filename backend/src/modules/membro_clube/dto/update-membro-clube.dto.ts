import { PartialType } from '@nestjs/swagger';
import { CreateMembroClubeDto } from './create-membro-clube.dto';

export class UpdateMembroClubeDto extends PartialType(CreateMembroClubeDto) {}
