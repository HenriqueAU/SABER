import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  IsNull,
  LessThan,
  Not,
  In,
} from 'typeorm';
import { Emprestimo } from './emprestimo.entity';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { UpdateEmprestimoDto } from './dto/update-emprestimo.dto';
import { ExemplarService } from '../exemplar/exemplar.service';
import { StatusExemplar } from '../exemplar/exemplar.entity';
import { TipoPerfil } from '../usuario/usuario.entity';
import { LivroGenero } from '../livro_genero/livro-genero.entity';
import { Genero } from '../genero/genero.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { StatusEmprestimo } from './emprestimo.entity';

interface GeneroQuantidade {
  genero: string;
  quantidade: string;
}

@Injectable()
export class EmprestimoService {
  constructor(
    @InjectRepository(Emprestimo)
    private readonly emprestimoRepository: Repository<Emprestimo>,
    private readonly exemplarService: ExemplarService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async create(createEmprestimoDto: CreateEmprestimoDto): Promise<Emprestimo> {
    const { exemplar_id, usuario_id, ...dadosEmprestimo } = createEmprestimoDto;

    const exemplarDisponivel = await this.exemplarService.findOne(exemplar_id);

    if (exemplarDisponivel.status !== StatusExemplar.DISPONIVEL) {
      throw new NotFoundException('Exemplar não está disponível');
    }

    await this.validarAlunoSemAtraso(usuario_id);
    await this.validarAlunoSemMesmoLivro(
      usuario_id,
      exemplarDisponivel.livro.id,
    );

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
  private async validarAlunoSemAtraso(usuarioId: string): Promise<void> {
    const atrasado = await this.emprestimoRepository.findOne({
      where: {
        usuario: { id: usuarioId },
        data_devolucao_efetiva: IsNull(),
        data_devolucao_esperada: LessThan(new Date()),
        status: StatusEmprestimo.ATIVO,
      },
    });

    if (atrasado) {
      throw new BadRequestException(
        'Aluno possui empréstimo em atraso e não pode retirar outro livro',
      );
    }
  }

  private async validarAlunoSemMesmoLivro(
    usuarioId: string,
    livroId: string,
  ): Promise<void> {
    const jaEmprestado = await this.emprestimoRepository
      .createQueryBuilder('emprestimo')
      .innerJoin('emprestimo.exemplar', 'exemplar')
      .where('emprestimo.usuario_id = :usuarioId', { usuarioId })
      .andWhere('exemplar.livro_id = :livroId', { livroId })
      .andWhere('emprestimo.data_devolucao_efetiva IS NULL')
      .getOne();

    if (jaEmprestado) {
      throw new BadRequestException(
        'Aluno já possui um exemplar deste livro emprestado',
      );
    }
  }
  async getLeiturasPorGenero(usuarioId: string) {
    const result = await this.emprestimoRepository
      .createQueryBuilder('emprestimo')
      .innerJoin('emprestimo.exemplar', 'exemplar')
      .innerJoin('exemplar.livro', 'livro')
      .innerJoin(
        LivroGenero,
        'livro_genero',
        'livro_genero.livro_id = livro.id',
      )
      .innerJoin(Genero, 'genero', 'livro_genero.genero_id = genero.id')
      .select('genero.nome', 'genero')
      .addSelect('COUNT(emprestimo.id)', 'quantidade')
      .where('emprestimo.usuario_id = :usuarioId', { usuarioId })
      .andWhere('emprestimo.data_devolucao_efetiva IS NOT NULL')
      .groupBy('genero.nome')
      .getRawMany();

    return (result as GeneroQuantidade[]).map((row) => ({
      genero: row.genero,
      quantidade: Number(row.quantidade),
    }));
  }
  async findAllAtrasados(): Promise<Emprestimo[]> {
    return await this.emprestimoRepository.find({
      where: {
        data_devolucao_efetiva: IsNull(),
        data_devolucao_esperada: LessThan(new Date()),
        status: Not(In(['danificado', 'perdido'])),
      },
      relations: [
        'exemplar',
        'exemplar.livro',
        'usuario',
        'usuario.instituicao',
      ],
    });
  }

  async findHistoricoByAluno(usuarioId: string): Promise<Emprestimo[]> {
    return await this.emprestimoRepository.find({
      where: {
        usuario: { id: usuarioId },
        data_devolucao_efetiva: Not(IsNull()),
      },
      order: { data_devolucao_efetiva: 'DESC' },
      relations: ['usuario', 'usuario.instituicao'],
    });
  }
  async marcarPerdido(id: string): Promise<Emprestimo> {
    const emprestimo = await this.findOne(id);
    await this.exemplarService.desativar(emprestimo.exemplar.id);
    await this.emprestimoRepository.update(id, {
      status: StatusEmprestimo.PERDIDO,
    });
    return await this.findOne(id);
  }

  async marcarDanificado(id: string): Promise<Emprestimo> {
    const emprestimo = await this.findOne(id);
    await this.exemplarService.update(emprestimo.exemplar.id, {
      status: StatusExemplar.DANIFICADO,
    });
    await this.emprestimoRepository.update(id, {
      status: StatusEmprestimo.DANIFICADO,
    });
    return await this.findOne(id);
  }
}
