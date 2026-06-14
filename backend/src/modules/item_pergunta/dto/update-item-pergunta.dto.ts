import { PartialType } from '@nestjs/swagger';
import { CreateItemPerguntaDto } from './create-item-pergunta.dto';

export class UpdateItemPerguntaDto extends PartialType(CreateItemPerguntaDto) {}
