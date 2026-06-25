import { Injectable } from '@nestjs/common';
import { ItemPergunta } from './item-pergunta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class ItemPerguntaService {
  constructor(
    @InjectRepository(ItemPergunta)
    private readonly itemPerguntaRepository: Repository<ItemPergunta>,
  ) {}

  async findAll(): Promise<ItemPergunta[]> {
    return await this.itemPerguntaRepository.find({ relations: ['pergunta'] });
  }

  async findOne(id: string): Promise<ItemPergunta> {
    const itemPergunta = await this.itemPerguntaRepository.findOne({
      where: { id },
      relations: ['pergunta'],
    });
    if (!itemPergunta) {
      throw new NotFoundException(`Item Pergunta não encontrado`);
    }
    return itemPergunta;
  }
}
