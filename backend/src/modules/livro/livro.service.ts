import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livro } from './livro.entity';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';

@Injectable()
export class LivroService {
  constructor(
    @InjectRepository(Livro)
    private readonly livroRepository: Repository<Livro>,
  ) {}

  async create(createLivroDto: CreateLivroDto): Promise<Livro> {
    const { instituicao_id, ...dadosLivro } = createLivroDto;

    const livro = this.livroRepository.create({
      ...dadosLivro,
      instituicao: { id: instituicao_id },
    });

    return await this.livroRepository.save(livro);
  }

  async findAll(): Promise<Livro[]> {
    return await this.livroRepository.find({ relations: ['instituicao'] });
  }

  async findOne(id: string): Promise<Livro> {
    const livro = await this.livroRepository.findOne({
      where: { id },
      relations: ['instituicao'],
    });
    if (!livro) throw new NotFoundException('Livro não encontrado');
    return livro;
  }

  async update(id: string, updateLivroDto: UpdateLivroDto): Promise<Livro> {
    const livro = await this.findOne(id);

    this.livroRepository.merge(livro, updateLivroDto);

    return await this.livroRepository.save(livro);
  }

  async remove(id: string): Promise<void> {
    const livro = await this.findOne(id);
    await this.livroRepository.remove(livro);
  }
}
