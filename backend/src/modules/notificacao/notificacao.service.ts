import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacao } from './notificacao.entity';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';

@Injectable()
export class NotificacaoService {
  constructor(
    @InjectRepository(Notificacao)
    private readonly notificacaoRepository: Repository<Notificacao>,
  ) {}

  async create(createNotificacaoDto: CreateNotificacaoDto): Promise<Notificacao> {
    const notificacao = this.notificacaoRepository.create({
      titulo: createNotificacaoDto.titulo,
      mensagem: createNotificacaoDto.mensagem,
      usuario_id: createNotificacaoDto.usuario_id,
    });
    return await this.notificacaoRepository.save(notificacao);
  }

  async findAllByUser(usuarioId: string): Promise<Notificacao[]> {
    return await this.notificacaoRepository.find({
      where: { usuario: { id: usuarioId } },
      order: { data: 'DESC' }, // As mais recentes primeiro
    });
  }

  async markAsRead(id: string, usuarioId: string): Promise<Notificacao> {
    const notificacao = await this.notificacaoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!notificacao) throw new NotFoundException('Notificação não encontrada');
    
    // Garante que o utilizador só lê as suas próprias notificações
    if (notificacao.usuario.id !== usuarioId) {
      throw new ForbiddenException('Acesso negado');
    }

    notificacao.lida = true;
    return await this.notificacaoRepository.save(notificacao);
  }
}