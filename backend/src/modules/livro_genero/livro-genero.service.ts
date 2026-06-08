import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LivroGenero } from './livro-genero.entity';
import { CreateLivroGeneroDto } from './dto/create-livro-genero.dto';

@Injectable()
export class LivroGeneroService {
  constructor(
    @InjectRepository(LivroGenero)
    private readonly livroGeneroRepository: Repository<LivroGenero>,
  ) {}

  async create(
    createLivroGeneroDto: CreateLivroGeneroDto,
  ): Promise<LivroGenero> {
    const livroGenero = this.livroGeneroRepository.create({
      livro: { id: createLivroGeneroDto.livro_id },
      genero: { id: createLivroGeneroDto.genero_id },
    });
    return await this.livroGeneroRepository.save(livroGenero);
  }

  async findAll(): Promise<LivroGenero[]> {
    return await this.livroGeneroRepository.find({
      relations: ['livro', 'genero'],
    });
  }

  async findOne(id: string): Promise<LivroGenero> {
    const livroGenero = await this.livroGeneroRepository.findOne({
      where: { id },
      relations: ['livro', 'genero'],
    });
    if (!livroGenero)
      throw new NotFoundException('Relação Livro-Gênero não encontrada');
    return livroGenero;
  }

  async remove(id: string): Promise<void> {
    const livroGenero = await this.findOne(id);
    await this.livroGeneroRepository.remove(livroGenero);
  }
}
