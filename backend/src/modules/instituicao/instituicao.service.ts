import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Instituicao } from './instituicao.entity';
import { Repository } from 'typeorm';
import { CreateInstituicaoDto } from './dto/create-instituicao.dto';
import { UpdateInstituicaoDto } from './dto/update-instituicao.dto';

@Injectable()
export class InstituicaoService {
  constructor(
    @InjectRepository(Instituicao)
    private readonly instituicaoRepository: Repository<Instituicao>,
  ) {}

  async create(
    createInstituicaoDto: CreateInstituicaoDto,
  ): Promise<Instituicao> {
    const instituicao = this.instituicaoRepository.create(createInstituicaoDto);
    return await this.instituicaoRepository.save(instituicao);
  }

  async findOne(id: string): Promise<Instituicao> {
    const instituicao = await this.instituicaoRepository.findOne({
      where: { id },
    });
    if (!instituicao) throw new NotFoundException('Instituição não encontrada');
    return instituicao;
  }

  async findAll(): Promise<Instituicao[]> {
    return await this.instituicaoRepository.find();
  }

  async update(
    id: string,
    updateInstituicaoDto: UpdateInstituicaoDto,
  ): Promise<Instituicao> {
    const instituicao = await this.findOne(id);
    this.instituicaoRepository.merge(instituicao, updateInstituicaoDto);
    return await this.instituicaoRepository.save(instituicao);
  }

  async remove(id: string): Promise<void> {
    const instituicao = await this.findOne(id);
    await this.instituicaoRepository.remove(instituicao);
  }
}
