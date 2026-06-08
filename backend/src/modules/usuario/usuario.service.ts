import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './usuario.entity';
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
    const { instituicao_id, senha, ...dadosUsuario } = createUsuarioDto;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senha, salt);
    const usuario = this.usuarioRepository.create({
      ...dadosUsuario,
      instituicao: { id: instituicao_id },
      senha_hash: hash,
    });
    return await this.usuarioRepository.save(usuario);
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
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

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);
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

  async remove(id: string) {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }
}
