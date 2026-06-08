import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exemplar } from './exemplar.entity';
import { CreateExemplarDto } from './dto/create-exemplar.dto';
import { UpdateExemplarDto } from './dto/update-exemplar.dto';

@Injectable()
export class ExemplarService {
  constructor(
    @InjectRepository(Exemplar)
    private readonly exemplarRepository: Repository<Exemplar>,
  ) {}

  async create(createExemplarDto: CreateExemplarDto): Promise<Exemplar> {
    const { livro_id, ...dadosExemplar } = createExemplarDto;

    const exemplar = this.exemplarRepository.create({
      ...dadosExemplar,
      livro: { id: livro_id },
    });

    return await this.exemplarRepository.save(exemplar);
  }

  async findAll(): Promise<Exemplar[]> {
    return await this.exemplarRepository.find({ relations: ['livro'] });
  }

  async findOne(id: string): Promise<Exemplar> {
    const exemplar = await this.exemplarRepository.findOne({
      where: { id },
      relations: ['livro'],
    });
    if (!exemplar) throw new NotFoundException('Exemplar não encontrado');
    return exemplar;
  }

  async update(
    id: string,
    updateExemplarDto: UpdateExemplarDto,
  ): Promise<Exemplar> {
    const exemplar = await this.findOne(id);

    this.exemplarRepository.merge(exemplar, updateExemplarDto);

    return await this.exemplarRepository.save(exemplar);
  }

  async remove(id: string): Promise<void> {
    const exemplar = await this.findOne(id);
    await this.exemplarRepository.remove(exemplar);
  }
}
