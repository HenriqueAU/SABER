import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MembroClube } from './membro-clube.entity';
import { Repository } from 'typeorm';
import { CreateMembroClubeDto } from './dto/create-membro-clube.dto';
import { UpdateMembroClubeDto } from './dto/update-membro-clube.dto';
import { ClubeService } from '../clube_livro/clube-livro.service';
import { Usuario } from '../usuario/usuario.entity';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class MembroClubeService {
  constructor(
    @InjectRepository(MembroClube)
    private readonly membroClubeRepository: Repository<MembroClube>,
    private readonly clubeService: ClubeService,
    private readonly usuarioService: UsuarioService,
  ) {}
  async create(
    createMembroClubeDto: CreateMembroClubeDto,
  ): Promise<MembroClube> {
    const { usuario_id, clube_id, ...dadosMembroClube } = createMembroClubeDto;

    await this.validarUsuario(usuario_id);

    const membroExistente = await this.membroClubeRepository.findOne({
      where: {
        usuario: { id: usuario_id },
        clube: { id: clube_id },
      },
    });

    if (membroExistente) {
      throw new ConflictException('Usuário já é membro deste clube');
    }

    const clube = await this.clubeService.findOne(
      createMembroClubeDto.clube_id,
    );

    if (!clube.ativo) {
      throw new BadRequestException(
        'Não é possível adicionar membros a um clube inativo',
      );
    }

    const novoMembroClube = this.membroClubeRepository.create({
      ...dadosMembroClube,
      usuario: { id: usuario_id },
      clube: { id: clube_id },
    });
    return await this.membroClubeRepository.save(novoMembroClube);
  }
  async findAll(clube_id: string): Promise<MembroClube[]> {
    return await this.membroClubeRepository.find({
      where: { clube: { id: clube_id } },
      relations: ['usuario', 'clube'],
    });
  }
  async findOne(id: string): Promise<MembroClube> {
    const membroClube = await this.membroClubeRepository.findOne({
      where: { id },
      relations: ['usuario', 'clube'],
    });
    if (!membroClube) {
      throw new NotFoundException('Membro do Clube não encontrado');
    }
    return membroClube;
  }
  async findMinhaInscricao(
    usuario_id: string,
    clube_id: string,
  ): Promise<MembroClube> {
    const membro = await this.membroClubeRepository.findOne({
      where: {
        usuario: { id: usuario_id },
        clube: { id: clube_id },
      },
    });
    if (!membro) {
      throw new NotFoundException(
        'Inscrição não encontrada para este usuário neste clube',
      );
    }
    return membro;
  }
  async update(
    id: string,
    updateMembroClubeDto: UpdateMembroClubeDto,
  ): Promise<MembroClube> {
    const membroClubeExistente = await this.findOne(id);

    this.membroClubeRepository.merge(
      membroClubeExistente,
      updateMembroClubeDto,
    );
    return await this.membroClubeRepository.save(membroClubeExistente);
  }
  async remove(id: string): Promise<void> {
    const membroClube = await this.findOne(id);
    await this.membroClubeRepository.remove(membroClube);
  }
  private async validarUsuario(usuario_id: string): Promise<Usuario> {
    const usuario = await this.usuarioService.findOneInterno(usuario_id);
    return usuario;
  }
}
