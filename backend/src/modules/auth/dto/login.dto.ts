import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'usuario.exemplo@email.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha123!',
  })
  @IsString()
  senha!: string;
}
