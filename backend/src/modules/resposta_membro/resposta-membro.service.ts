import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RespostaMembro } from './resposta-membro.entity';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';
import { MembroClube } from '../membro_clube/membro-clube.entity';
import { ItemPergunta } from '../item_pergunta/item-pergunta.entity';

@Injectable()
export class RespostaMembroService {
  constructor(
    @InjectRepository(RespostaMembro)
    private readonly respostaMembroRepository: Repository<RespostaMembro>,

    @InjectRepository(MembroClube)
    private readonly membroClubeRepository: Repository<MembroClube>,

    @InjectRepository(ItemPergunta)
    private readonly itemPerguntaRepository: Repository<ItemPergunta>,
  ) {}

  async create(
    createRespostaMembroDto: CreateRespostaMembroDto,
  ): Promise<RespostaMembro> {
    const { membro_id, item_pergunta_id, ...dadosRespostaMembro } =
      createRespostaMembroDto;

    await this.validarMembroClube(membro_id);
    await this.validarItemPergunta(item_pergunta_id);

    const novaRespostaMembro = this.respostaMembroRepository.create({
      ...dadosRespostaMembro,
      membro: { id: membro_id },
      itemPergunta: { id: item_pergunta_id },
    });

    return await this.respostaMembroRepository.save(novaRespostaMembro);
  }

  async findAll(): Promise<RespostaMembro[]> {
    return await this.respostaMembroRepository.find({
      relations: ['membro', 'itemPergunta'],
    });
  }
  async findOne(id: string): Promise<RespostaMembro> {
    const respostaMembro = await this.respostaMembroRepository.findOne({
      where: { id },
      relations: ['membro', 'itemPergunta'],
    });
    if (!respostaMembro) {
      throw new NotFoundException('Resposta do Membro não encontrada');
    }
    return respostaMembro;
  }
  async remove(id: string): Promise<void> {
    const respostaMembro = await this.findOne(id);
    await this.respostaMembroRepository.remove(respostaMembro);
  }

  private async validarMembroClube(membroId: string): Promise<MembroClube> {
    const membro = await this.membroClubeRepository.findOne({
      where: { id: membroId },
    });

    if (!membro) {
      throw new NotFoundException('Membro do clube não encontrado');
    }

    return membro;
  }

  private async validarItemPergunta(
    itemPerguntaId: string,
  ): Promise<ItemPergunta> {
    const itemPergunta = await this.itemPerguntaRepository.findOne({
      where: { id: itemPerguntaId },
    });

    if (!itemPergunta) {
      throw new NotFoundException('Item de pergunta não encontrado');
    }

    return itemPergunta;
  }
}
