import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from './genero.entity';

@Injectable()
export class GeneroService {
  constructor(
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) {}

  async findAll(): Promise<Genero[]> {
    return await this.generoRepository.find();
  }

  async findOne(id: string): Promise<Genero> {
    const genero = await this.generoRepository.findOne({ where: { id } });
    if (!genero) throw new NotFoundException('Gênero não encontrado');
    return genero;
  }
}
