import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emprestimo } from './emprestimo.entity';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { UpdateEmprestimoDto } from './dto/update-emprestimo.dto';

@Injectable()
export class EmprestimoService {
  constructor(
    @InjectRepository(Emprestimo)
    private readonly emprestimoRepository: Repository<Emprestimo>,
  ) {}

  async create(createEmprestimoDto: CreateEmprestimoDto): Promise<Emprestimo> {
    const { exemplar_id, usuario_id, ...dadosEmprestimo } = createEmprestimoDto;

    const emprestimo = this.emprestimoRepository.create({
      ...dadosEmprestimo,
      exemplar: { id: exemplar_id },
      usuario: { id: usuario_id },
    });

    return await this.emprestimoRepository.save(emprestimo);
  }

  async findAll(): Promise<Emprestimo[]> {
    return await this.emprestimoRepository.find({
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

    this.emprestimoRepository.merge(emprestimo, updateEmprestimoDto);

    return await this.emprestimoRepository.save(emprestimo);
  }

  async remove(id: string): Promise<void> {
    const emprestimo = await this.findOne(id);
    await this.emprestimoRepository.remove(emprestimo);
  }
}
