import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RespostaMembro } from './resposta-membro.entity';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';
import { MembroClube } from '../membro_clube/membro-clube.entity';
import { ItemPergunta } from '../item_pergunta/item-pergunta.entity';
import { MembroClubeService } from '../membro_clube/membro-clube.service';
import { ItemPerguntaService } from '../item_pergunta/item-pergunta.service';
import { TipoPerfil } from '../usuario/usuario.entity';
import { NotificacaoService } from '../notificacao/notificacao.service';

@Injectable()
export class RespostaMembroService {
  private readonly controleDeDisparo = new Map<string, number>();

  constructor(
    @InjectRepository(RespostaMembro)
    private readonly respostaMembroRepository: Repository<RespostaMembro>,
    private readonly membroClubeService: MembroClubeService,
    private readonly itemPerguntaService: ItemPerguntaService,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  async create(
    createRespostaMembroDto: CreateRespostaMembroDto,
    alunoLogadoId: string,
  ): Promise<RespostaMembro> {
    const { membro_id, item_pergunta_id, ...dadosRespostaMembro } =
      createRespostaMembroDto;

    const membro = await this.validarMembroClube(membro_id);

    if (membro.usuario.id != alunoLogadoId) {
      throw new ForbiddenException(
        'Você só pode responder utilizando a sua própria participação no clube',
      );
    }

    const jaRespondeu = await this.respostaMembroRepository.findOne({
      where: { membro: { id: membro_id } },
    });

    if (jaRespondeu) {
      throw new ConflictException('Você já avaliou este clube.');
    }

    await this.validarItemPergunta(item_pergunta_id);

    const novaRespostaMembro = this.respostaMembroRepository.create({
      ...dadosRespostaMembro,
      membro: { id: membro_id },
      itemPergunta: { id: item_pergunta_id },
    });

    const salva = await this.respostaMembroRepository.save(novaRespostaMembro);
    const respostaCompleta = await this.respostaMembroRepository.findOne({
      where: { id: salva.id },
      relations: [
        'membro',
        'membro.usuario',
        'membro.clube',
        'membro.clube.professor',
      ],
    });

    if (respostaCompleta && respostaCompleta.membro.clube.professor) {
      const professorId = respostaCompleta.membro.clube.professor.id;
      const nomeAluno = respostaCompleta.membro.usuario.nome;
      const nomeClube =
        respostaCompleta.membro.clube.nome || 'Clube de Leitura';
      const clubeId = respostaCompleta.membro.clube.id;

      const chaveLock = `${alunoLogadoId}_${clubeId}`;
      const tempoAtual = Date.now();
      const tempoUltimoDisparo = this.controleDeDisparo.get(chaveLock) || 0;

      if (tempoAtual - tempoUltimoDisparo < 10000) {
        return salva;
      }
      this.controleDeDisparo.set(chaveLock, tempoAtual);

      const mensagemExata = `O aluno ${nomeAluno} respondeu ao questionário do clube ${nomeClube}.[CLUBE:${clubeId}]`;
      const notificacoes =
        await this.notificacaoService.findAllByUser(professorId);
      const jaFoiNotificado = notificacoes.some((n) => {
        if (n.mensagem !== mensagemExata) return false;

        const dataNotificacao = new Date(n.data).getTime();
        const tempoReferencia = respostaCompleta.created_at
          ? new Date(respostaCompleta.created_at).getTime()
          : Date.now();
        const diferencaEmSegundos = Math.abs(
          (tempoReferencia - dataNotificacao) / 1000,
        );
        return diferencaEmSegundos < 60;
      });

      if (!jaFoiNotificado) {
        await this.notificacaoService.create({
          titulo: 'Novo Feedback de Leitura',
          mensagem: mensagemExata,
          usuario_id: professorId,
        });
      }
    }
    return salva;
  }

  async findAll(
    usuarioLogadoId: string,
    perfilLogado: TipoPerfil,
  ): Promise<RespostaMembro[]> {
    if (perfilLogado === TipoPerfil.PROFESSOR) {
      return await this.respostaMembroRepository.find({
        where: { membro: { clube: { professor: { id: usuarioLogadoId } } } },
        relations: [
          'membro',
          'membro.clube',
          'membro.clube.professor',
          'itemPergunta',
        ],
      });
    }

    return await this.respostaMembroRepository.find({
      where: { membro: { usuario: { id: usuarioLogadoId } } },
      relations: ['membro', 'membro.usuario', 'itemPergunta'],
    });
  }

  async findOne(
    id: string,
    usuarioLogadoId: string,
    perfilLogado: TipoPerfil,
  ): Promise<RespostaMembro> {
    const respostaMembro = await this.respostaMembroRepository.findOne({
      where: { id },
      relations: [
        'membro',
        'membro.usuario',
        'membro.clube',
        'membro.clube.professor',
        'itemPergunta',
      ],
    });

    if (!respostaMembro) {
      throw new NotFoundException('Resposta do Membro não encontrada');
    }
    if (perfilLogado === TipoPerfil.PROFESSOR) {
      if (respostaMembro.membro.clube.professor.id !== usuarioLogadoId) {
        throw new ForbiddenException(
          'Apenas o professor responsavel pelo clube pode ver esta resposta',
        );
      }
    } else {
      if (respostaMembro.membro.usuario.id !== usuarioLogadoId) {
        throw new ForbiddenException(
          'Você só pode ver as suas próprias respostas',
        );
      }
    }
    return respostaMembro;
  }

  private async validarMembroClube(membro_id: string): Promise<MembroClube> {
    const membro = await this.membroClubeService.findOne(membro_id);
    return membro;
  }

  private async validarItemPergunta(
    item_pergunta_id: string,
  ): Promise<ItemPergunta> {
    const itemPergunta =
      await this.itemPerguntaService.findOne(item_pergunta_id);
    return itemPergunta;
  }
}
