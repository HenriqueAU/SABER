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

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const { senha, email } = loginDto;
    const usuario = await this.findOne(email);
    const credenciais = await bcrypt.compare(senha, usuario.senha_hash);
    if (!credenciais) {
      throw new UnauthorizedException('Credenciais inválidas');
    } else {
      const payload = {
        instituicao: usuario.instituicao.id,
        id: usuario.id,
        perfil: usuario.perfil,
        email: usuario.email,
      };
      return { access_token: this.jwtService.sign(payload) };
    }
  }
}
