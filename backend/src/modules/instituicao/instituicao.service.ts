import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findOne(
    id: string,
    instituicaoUsuarioId: string,
  ): Promise<Instituicao> {
    if (instituicaoUsuarioId !== id) {
      throw new ForbiddenException(
        'Acesso negado: você não pertence a esta instituição',
      );
    }
    const instituicao = await this.instituicaoRepository.findOne({
      where: { id },
    });
    if (!instituicao) throw new NotFoundException('Instituição não encontrada');
    return instituicao;
  }

  async findAll(instituicaoUsuarioId: string): Promise<Instituicao[]> {
    return await this.instituicaoRepository.find({
      where: { id: instituicaoUsuarioId },
    });
  }

  async update(
    id: string,
    instituicaoUsuarioId: string,
    updateInstituicaoDto: UpdateInstituicaoDto,
  ): Promise<Instituicao> {
    const instituicao = await this.findOne(id, instituicaoUsuarioId);
    this.instituicaoRepository.merge(instituicao, updateInstituicaoDto);
    return await this.instituicaoRepository.save(instituicao);
  }
}
