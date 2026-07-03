import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emprestimo } from './emprestimo.entity';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { UpdateEmprestimoDto } from './dto/update-emprestimo.dto';
import { ExemplarService } from '../exemplar/exemplar.service';
import { StatusExemplar } from '../exemplar/exemplar.entity';
import { TipoPerfil } from '../usuario/usuario.entity';
import { FindOptionsWhere } from 'typeorm';
import { LivroGenero } from '../livro_genero/livro-genero.entity';
import { Genero } from '../genero/genero.entity';

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

  async findAll(
    instituicao_id: string,
    perfilLogado: TipoPerfil,
    usuarioId: string,
  ): Promise<Emprestimo[]> {
    if (perfilLogado === TipoPerfil.ALUNO) {
      return await this.emprestimoRepository.find({
        where: {
          usuario: {
            instituicao: { id: instituicao_id },
            id: usuarioId,
          },
        },
        relations: ['exemplar', 'usuario', 'exemplar.livro'],
      });
    }

    return await this.emprestimoRepository.find({
      where: {
        usuario: {
          instituicao: { id: instituicao_id },
        },
      },
      relations: ['exemplar', 'usuario', 'exemplar.livro'],
    });
  }

  async findOne(
    id: string,
    perfilLogado?: TipoPerfil,
    usuarioId?: string,
  ): Promise<Emprestimo> {
    const where: FindOptionsWhere<Emprestimo> = { id };

    if (perfilLogado === TipoPerfil.ALUNO && usuarioId) {
      where.usuario = { id: usuarioId };
    }

    const emprestimo = await this.emprestimoRepository.findOne({
      where,
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

  async getLeiturasPorGenero(usuarioId: string) {
    const result = await this.emprestimoRepository.createQueryBuilder('emprestimo')
      .innerJoin('emprestimo.exemplar', 'exemplar')
      .innerJoin('exemplar.livro', 'livro')
      .innerJoin(LivroGenero, 'livro_genero', 'livro_genero.livro_id = livro.id')
      .innerJoin(Genero, 'genero', 'livro_genero.genero_id = genero.id')
      .select('genero.nome', 'genero')
      .addSelect('COUNT(emprestimo.id)', 'quantidade')
      .where('emprestimo.usuario_id = :usuarioId', { usuarioId })
      .andWhere('emprestimo.data_devolucao_efetiva IS NOT NULL')
      .groupBy('genero.nome')
      .getRawMany();

    return result.map(row => ({
      genero: row.genero,
      quantidade: Number(row.quantidade)
    }));
  }
}
