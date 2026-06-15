import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RespostaMembro } from './resposta-membro.entity';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';
import { MembroClube } from '../membro_clube/membro-clube.entity';
import { ItemPergunta } from '../item_pergunta/item-pergunta.entity';
import { MembroClubeService } from '../membro_clube/membro-clube.service';
import { ItemPerguntaService } from '../item_pergunta/item-pergunta.service';

@Injectable()
export class RespostaMembroService {
  constructor(
    @InjectRepository(RespostaMembro)
    private readonly respostaMembroRepository: Repository<RespostaMembro>,
    private readonly membroClubeService: MembroClubeService,
    private readonly itemPerguntaService: ItemPerguntaService,
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
