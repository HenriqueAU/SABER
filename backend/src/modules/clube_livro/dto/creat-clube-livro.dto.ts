import { IsDateString, 
IsNotEmpty, 
IsOptional, 
IsString, 
IsUUID, 
} from "class-validator";


export class CreateClubeLivroDto {
    @IsUUID()
    @IsNotEmpty()
    professor_id!: string;   

    @IsUUID()
    @IsNotEmpty()
    livro_id!: string;

    @IsString()
    @IsNotEmpty()
    nome!: string;

    @IsDateString()
    @IsOptional()
    data_inicio!: Date|null;

    @IsDateString()
    @IsOptional()
    data_fim!: Date|null;

    @IsString()
    @IsOptional()
    local_encontro!: string|null;
}