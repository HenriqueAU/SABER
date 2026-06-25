import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pergunta } from './pergunta.entity';

@Injectable()
export class PerguntaService {
  constructor(
    @InjectRepository(Pergunta)
    private readonly perguntaRepository: Repository<Pergunta>,
  ) {}

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
}
