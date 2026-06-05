import { PartialType } from "@nestjs/mapped-types";
import { CreateItemPerguntaDto } from "./create-item-pergunta.dto";

export class UpdateItemPerguntaDto extends PartialType(CreateItemPerguntaDto) {}