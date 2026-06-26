import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoPerfil, Usuario } from './usuario.entity';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const { instituicao_id, senha, email, ...dadosUsuario } = createUsuarioDto;
    const emailJaExiste = await this.findByEmailSemExcecao(email);
    if (emailJaExiste) {
      throw new ConflictException(
        'Este e-mail já está cadastrado na base de dados',
      );
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(senha, salt);
      const usuario = this.usuarioRepository.create({
        ...dadosUsuario,
        instituicao: { id: instituicao_id },
        senha_hash: hash,
        email: email,
      });
      return await this.usuarioRepository.save(usuario);
    }
  }

  async findOne(
    id: string,
    usuarioLogadoId: string,
    perfilLogado: TipoPerfil,
  ): Promise<Usuario> {
    if (perfilLogado !== TipoPerfil.GESTOR && usuarioLogadoId !== id) {
      throw new ForbiddenException('Acesso negado');
    }
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['instituicao'],
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async findOneInterno(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
      relations: ['instituicao'],
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async findByEmail(email: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['instituicao'],
    });
    if (!usuario) throw new NotFoundException('Email não encontrado');
    return usuario;
  }

  async findByEmailSemExcecao(email: string): Promise<Usuario | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { email },
      relations: ['instituicao'],
    });
    if (!usuario) {
      return null;
    } else {
      return usuario;
    }
  }

  async findAll(instituicao_id: string): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      where: { instituicao: { id: instituicao_id } },
      relations: ['instituicao'],
    });
  }

  async update(
    id: string,
    usuarioLogadoId: string,
    perfilLogado: TipoPerfil,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    if (usuarioLogadoId !== id) {
      throw new ForbiddenException('Você só pode atualizar o próprio perfil');
    }
    const usuario = await this.findOne(id, usuarioLogadoId, perfilLogado);
    const { senha, ...dadosUsuario } = updateUsuarioDto;
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(senha, salt);
      this.usuarioRepository.merge(usuario, {
        ...dadosUsuario,
        senha_hash: hash,
      });
    } else {
      this.usuarioRepository.merge(usuario, updateUsuarioDto);
    }
    return await this.usuarioRepository.save(usuario);
  }

  async alterarSenha(
    id: string,
    usuarioLogadoId: string,
    senhaAtual: string,
    novaSenha: string,
  ): Promise<void> {
    if (usuarioLogadoId !== id) {
      throw new ForbiddenException('Você só pode alterar a própria senha');
    }

    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
    if (!senhaValida) {
      throw new BadRequestException('A senha atual está incorreta.');
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(novaSenha, salt);
    
    usuario.senha_hash = hash;
    await this.usuarioRepository.save(usuario);
  }

  async remove(id: string, usuarioLogadoId: string, perfilLogado: TipoPerfil) {
    const usuario = await this.findOne(id, usuarioLogadoId, perfilLogado);
    await this.usuarioRepository.remove(usuario);
  }
}
