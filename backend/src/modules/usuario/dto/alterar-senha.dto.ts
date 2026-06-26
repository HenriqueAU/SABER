import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AlterarSenhaDto {
  @ApiProperty({ description: 'Senha atual do usuário' })
  @IsString()
  @IsNotEmpty()
  senha_atual!: string;

  @ApiProperty({ description: 'Nova senha desejada' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  nova_senha!: string;
}
