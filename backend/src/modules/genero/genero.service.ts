import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genero } from './genero.entity';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';

@Injectable()
export class GeneroService {
  constructor(
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) {}

  async create(createGeneroDto: CreateGeneroDto): Promise<Genero> {
    const genero = this.generoRepository.create(createGeneroDto);
    return await this.generoRepository.save(genero);
  }

  async findAll(): Promise<Genero[]> {
    return await this.generoRepository.find();
  }

  async findOne(id: string): Promise<Genero> {
    const genero = await this.generoRepository.findOne({ where: { id } });
    if (!genero) throw new NotFoundException('Gênero não encontrado');
    return genero;
  }

  async update(id: string, updateGeneroDto: UpdateGeneroDto): Promise<Genero> {
    const genero = await this.findOne(id);
    this.generoRepository.merge(genero, updateGeneroDto);
    return await this.generoRepository.save(genero);
  }

  async remove(id: string): Promise<void> {
    const genero = await this.findOne(id);
    await this.generoRepository.remove(genero);
  }
}
