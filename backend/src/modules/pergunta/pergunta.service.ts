import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePerguntaDto } from './dto/create-pergunta.dto';
import { Pergunta } from './pergunta.entity';
import { UpdatePerguntaDto } from './dto/update-pergunta.dto';

@Injectable()
export class PerguntaService {
  constructor(
    @InjectRepository(Pergunta)
    private readonly perguntaRepository: Repository<Pergunta>,
  ) {}

  async create(createPerguntaDto: CreatePerguntaDto): Promise<Pergunta> {
    const pergunta = this.perguntaRepository.create(createPerguntaDto);

    return await this.perguntaRepository.save(pergunta);
  }

  async findAll(): Promise<Pergunta[]> {
    return await this.perguntaRepository.find();
  }

  async findOne(id: string): Promise<Pergunta> {
    const pergunta = await this.perguntaRepository.findOne({
      where: { id },
    });
    if (!pergunta) throw new NotFoundException('Pergunta não encontrada');
    return pergunta;
  }

  async update(
    id: string,
    updatePerguntaDto: UpdatePerguntaDto,
  ): Promise<Pergunta> {
    const pergunta = await this.findOne(id);

    this.perguntaRepository.merge(pergunta, updatePerguntaDto);
    return await this.perguntaRepository.save(pergunta);
  }

  async remove(id: string): Promise<void> {
    const pergunta = await this.findOne(id);
    await this.perguntaRepository.remove(pergunta);
  }
}
