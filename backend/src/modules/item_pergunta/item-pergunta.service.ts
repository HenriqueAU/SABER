import { Injectable } from '@nestjs/common';
import { ItemPergunta } from './item-pergunta.entity';
import { InjectRepository,  } from '@nestjs/typeorm';
import { CreateItemPerguntaDto } from './dto/create-item-pergunta.dto';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdateItemPerguntaDto } from './dto/update-item-pergunta.dto';

@Injectable()

export class ItemPerguntaService {
    constructor(    
        @InjectRepository(ItemPergunta)
        private readonly itemPerguntaRepository: Repository<ItemPergunta>,

    ){}
    async create(createItemPerguntaDto: CreateItemPerguntaDto): Promise<ItemPergunta> {

    const { pergunta_id, ...dadosItemPergunta } = createItemPerguntaDto;
    
    const itemPergunta = this.itemPerguntaRepository.create({
      ...dadosItemPergunta,
      pergunta: { id: pergunta_id }, 
    });

    return await this.itemPerguntaRepository.save(itemPergunta);
  }
    async findAll(): Promise<ItemPergunta[]> {
        return await this.itemPerguntaRepository.find({relations: ['pergunta']});
    }
    async findOne(id: string): Promise<ItemPergunta> {
        const itemPergunta = await this.itemPerguntaRepository.findOne({where: {id}, relations: ['pergunta']});
        if (!itemPergunta) {
            throw new NotFoundException(`Item Pergunta não encontrado`);
        }
        return itemPergunta;
    }
    async update(id: string, updateItemPerguntaDto: UpdateItemPerguntaDto): Promise<ItemPergunta> {
        const itemPergunta = await this.findOne(id);

        this.itemPerguntaRepository.merge(itemPergunta, updateItemPerguntaDto);
        return await this.itemPerguntaRepository.save(itemPergunta);
    }
    async remove(id: string): Promise<void> {
        const itemPergunta = await this.findOne(id);
        await this.itemPerguntaRepository.remove(itemPergunta);
    }
}   


