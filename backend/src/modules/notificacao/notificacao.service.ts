import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Notificacao } from './notificacao.entity';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { EmprestimoService } from '../emprestimo/emprestimo.service';
import { UsuarioService } from '../usuario/usuario.service';
import { MembroClubeService } from '../membro_clube/membro-clube.service';
import { ClubeService } from '../clube_livro/clube-livro.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TipoPerfil } from '../usuario/usuario.entity';

@Injectable()
export class NotificacaoService {
  constructor(
    @InjectRepository(Notificacao)
    private readonly notificacaoRepository: Repository<Notificacao>,
    private readonly emprestimoService: EmprestimoService,
    private readonly usuarioService: UsuarioService,
    private readonly membroClubeService: MembroClubeService,
    private readonly clubeService: ClubeService,
  ) {}

  async create(
    createNotificacaoDto: CreateNotificacaoDto,
  ): Promise<Notificacao> {
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
      order: { data: 'DESC' },
    });
  }

  async markAsRead(id: string, usuarioId: string): Promise<Notificacao> {
    const notificacao = await this.notificacaoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!notificacao) throw new NotFoundException('Notificação não encontrada');

    if (notificacao.usuario.id !== usuarioId) {
      throw new ForbiddenException('Acesso negado');
    }

    notificacao.lida = true;
    return await this.notificacaoRepository.save(notificacao);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async notificarBibliotecarioAtrasos(): Promise<void> {
    const hoje = new Date();
    const atrasados = await this.emprestimoService.findAllAtrasados();
    for (const emp of atrasados) {
      const diasAtraso = Math.floor(
        (hoje.getTime() - new Date(emp.data_devolucao_esperada).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const usuarios = await this.usuarioService.findAll(
        emp.usuario.instituicao.id,
      );
      const bibliotecarios = usuarios.filter(
        (u) => u.perfil === TipoPerfil.BIBLIOTECARIO,
      );
      for (const bib of bibliotecarios) {
        await this.create({
          titulo: 'Empréstimo em Atraso',
          mensagem: `O aluno ${emp.usuario.nome} está com o livro "${emp.exemplar.livro.titulo}" em atraso há ${diasAtraso} dia(s).`,
          usuario_id: bib.id,
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async notificarGestorAtrasos(): Promise<void> {
    const emprestimosAtrasados =
      await this.emprestimoService.findAllAtrasados();
    const alunoIds = [
      ...new Set(emprestimosAtrasados.map((e) => e.usuario.id)),
    ];
    for (const alunoId of alunoIds) {
      const historico =
        await this.emprestimoService.findHistoricoByAluno(alunoId);
      let consecutivos = 0;
      for (const emp of historico) {
        if (
          new Date(emp.data_devolucao_efetiva!) >
          new Date(emp.data_devolucao_esperada)
        ) {
          consecutivos++;
        } else {
          break;
        }
      }
      const gruposDeAtraso = Math.floor(consecutivos / 3);
      if (gruposDeAtraso === 0) continue;
      const aluno = historico[0].usuario;
      const instituicaoId = aluno.instituicao.id;
      const notificacoesExistentes = await this.notificacaoRepository
        .createQueryBuilder('notificacao')
        .innerJoin('notificacao.usuario', 'usuario')
        .where('usuario.instituicao_id = :instituicaoId', { instituicaoId })
        .andWhere('notificacao.titulo = :titulo', {
          titulo: 'Padrão de Atrasos Consecutivos',
        })
        .andWhere('notificacao.mensagem LIKE :aluno', {
          aluno: `%${aluno.nome}%`,
        })
        .getCount();
      if (gruposDeAtraso > notificacoesExistentes) {
        const usuarios = await this.usuarioService.findAll(instituicaoId);
        const gestores = usuarios.filter((u) => u.perfil === TipoPerfil.GESTOR);
        for (const gestor of gestores) {
          await this.create({
            titulo: 'Padrão de Atrasos Consecutivos',
            mensagem: `O aluno ${aluno.nome} devolveu os últimos ${consecutivos} livros com atraso. Verifique o histórico deste aluno.`,
            usuario_id: gestor.id,
          });
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async notificarAlunos(): Promise<void> {
    const membrosEmClubesEncerrados =
      await this.membroClubeService.findTodosMembrosEmClubesEncerrados();
    for (const membro of membrosEmClubesEncerrados) {
      const jaNotificado = await this.notificacaoRepository.findOne({
        where: {
          usuario_id: membro.usuario.id,
          titulo: 'Clube de Leitura Encerrado',
          mensagem: Like(`%${membro.clube.nome}%`),
        },
      });
      if (!jaNotificado) {
        await this.create({
          titulo: 'Clube de Leitura Encerrado',
          mensagem: `O clube "${membro.clube.nome}" do qual você participava foi encerrado.`,
          usuario_id: membro.usuario.id,
        });
      }
    }
    const emprestimosAtrasados =
      await this.emprestimoService.findAllAtrasados();
    const hoje = new Date();
    for (const emp of emprestimosAtrasados) {
      const diasAtraso = Math.floor(
        (hoje.getTime() - new Date(emp.data_devolucao_esperada).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      await this.create({
        titulo: 'Devolução em Atraso',
        mensagem: `O livro "${emp.exemplar.livro.titulo}" está com devolução em atraso há ${diasAtraso} dia(s). Por favor, devolva o quanto antes.`,
        usuario_id: emp.usuario.id,
      });
    }
  }
}
