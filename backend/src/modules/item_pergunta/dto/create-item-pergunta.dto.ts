import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateItemPerguntaDto {

    @IsUUID()
    @IsNotEmpty()
    pergunta_id!: string;

    @IsString()
    @IsNotEmpty()
    texto!: string;
}