import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emprestimo } from './emprestimo.entity';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { UpdateEmprestimoDto } from './dto/update-emprestimo.dto';
import { ExemplarService } from '../exemplar/exemplar.service';
import { StatusExemplar } from '../exemplar/exemplar.entity';

@Injectable()
export class EmprestimoService {
  constructor(
    @InjectRepository(Emprestimo)
    private readonly emprestimoRepository: Repository<Emprestimo>,
    private readonly exemplarService: ExemplarService,
  ) {}

  async create(createEmprestimoDto: CreateEmprestimoDto): Promise<Emprestimo> {
    const { exemplar_id, usuario_id, ...dadosEmprestimo } = createEmprestimoDto;

    const exemplarDisponivel = await this.exemplarService.findOne(exemplar_id);

    if (exemplarDisponivel.status !== StatusExemplar.DISPONIVEL) {
      throw new NotFoundException('Exemplar não está disponível');
    } else {
      const emprestimo = this.emprestimoRepository.create({
        ...dadosEmprestimo,
        exemplar: { id: exemplar_id },
        usuario: { id: usuario_id },
      });

      await this.emprestimoRepository.save(emprestimo);

      await this.exemplarService.update(exemplar_id, {
        status: StatusExemplar.EMPRESTADO,
      });

      return emprestimo;
    }
  }

  async findAll(instituicao_id: string): Promise<Emprestimo[]> {
    return await this.emprestimoRepository.find({
      where: {
        usuario: {
          instituicao: { id: instituicao_id },
        },
      },
      relations: ['exemplar', 'usuario'],
    });
  }

  async findOne(id: string): Promise<Emprestimo> {
    const emprestimo = await this.emprestimoRepository.findOne({
      where: { id },
      relations: ['exemplar', 'usuario'],
    });
    if (!emprestimo) throw new NotFoundException('Empréstimo não encontrado');
    return emprestimo;
  }

  async update(
    id: string,
    updateEmprestimoDto: UpdateEmprestimoDto,
  ): Promise<Emprestimo> {
    const emprestimo = await this.findOne(id);

    if (updateEmprestimoDto.data_devolucao_efetiva) {
      await this.exemplarService.update(emprestimo.exemplar.id, {
        status: StatusExemplar.DISPONIVEL,
      });
    }
    this.emprestimoRepository.merge(emprestimo, updateEmprestimoDto);

    return await this.emprestimoRepository.save(emprestimo);
  }

  async remove(id: string): Promise<void> {
    const emprestimo = await this.findOne(id);
    await this.emprestimoRepository.remove(emprestimo);
  }
}
