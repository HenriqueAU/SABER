import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from '../usuario/usuario.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async findOne(email: string): Promise<Usuario> {
    const usuario = await this.usuarioService.findByEmail(email);
    return usuario;
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { senha, email } = loginDto;
    const usuario = await this.findOne(email);
    const credenciais = await bcrypt.compare(senha, usuario.senha_hash);
    if (!credenciais) {
      return new UnauthorizedException('Credenciais inválidas');
    } else {
      const payload = {
        id: usuario.id,
        perfil: usuario.perfil,
        email: usuario.email,
      };
      return { acces_token: this.jwtService.sign(payload) };
    }
  }
}
