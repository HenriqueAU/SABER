import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RespostaMembro } from './resposta-membro.entity';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';
import { MembroClube } from '../membro_clube/membro-clube.entity';
import { ItemPergunta } from '../item_pergunta/item-pergunta.entity';
import { MembroClubeService } from '../membro_clube/membro-clube.service';
import { ItemPerguntaService } from '../item_pergunta/item-pergunta.service';
import { TipoPerfil } from '../usuario/usuario.entity'

@Injectable()
export class RespostaMembroService {
  constructor(
    @InjectRepository(RespostaMembro)
    private readonly respostaMembroRepository: Repository<RespostaMembro>,
    private readonly membroClubeService: MembroClubeService,
    private readonly itemPerguntaService: ItemPerguntaService,
  ) {}

  async create(
    createRespostaMembroDto: CreateRespostaMembroDto, alunoLogadoId:string,
  ): Promise<RespostaMembro> {
    const { membro_id, item_pergunta_id, ...dadosRespostaMembro } =
      createRespostaMembroDto;

    const membro = await this.validarMembroClube(membro_id);

    if(membro.usuario.id != alunoLogadoId){
      throw new ForbiddenException(
        'Você só pode responder utilizando a sua própria participação no clube',
      )
    }

    await this.validarItemPergunta(item_pergunta_id);

    const novaRespostaMembro = this.respostaMembroRepository.create({
      ...dadosRespostaMembro,
      membro: { id: membro_id },
      itemPergunta: { id: item_pergunta_id },
    });

    return await this.respostaMembroRepository.save(novaRespostaMembro);
  }

   async findAll(
    usuarioLogadoId: string,
    perfilLogado: TipoPerfil,
  ): Promise<RespostaMembro[]> {
    if (perfilLogado === TipoPerfil.PROFESSOR) {
      return await this.respostaMembroRepository.find({
        where: { membro: { clube: { professor: { id: usuarioLogadoId } } } },
        relations: ['membro', 'membro.clube', 'membro.clube.professor', 'itemPergunta'],
      });
    }

    return await this.respostaMembroRepository.find({
      where: { membro: { usuario: { id: usuarioLogadoId } } },
      relations: ['membro', 'membro.usuario', 'itemPergunta'],
    });
  }

  async findOne(id: string, usuarioLogadoId: string, perfilLogado: TipoPerfil): Promise<RespostaMembro> {
    const respostaMembro = await this.respostaMembroRepository.findOne({
      where: { id },
      relations: ['membro','membro.usuario', 'membro.clube', 'membro.clube.professor', 'itemPergunta'],
    });

    if (!respostaMembro) {
      throw new NotFoundException('Resposta do Membro não encontrada');
    }
    if(perfilLogado === TipoPerfil.PROFESSOR){
      if(respostaMembro.membro.clube.professor.id !== usuarioLogadoId){
        throw new ForbiddenException(
          'Apenas o professor responsavel pelo clube pode ver esta resposta',
        );
      }
    }else{
      if(respostaMembro.membro.usuario.id !== usuarioLogadoId){
        throw new ForbiddenException(
          'Você só pode ver as suas próprias respostas'
        )
      }
    }
    return respostaMembro;
  }
  async remove(id: string): Promise<void> {
    const respostaMembro = await this.findOneSemFiltro(id);
    await this.respostaMembroRepository.remove(respostaMembro);
  }
  private async findOneSemFiltro(id: string): Promise<RespostaMembro>{
    const respostaMembro = await this.respostaMembroRepository.findOne({
      where: { id },
      relations: ['membro', 'itemPergunta'],
    });
    if(!respostaMembro){
      throw new NotFoundException('Resposta do Membro não encontra');
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
