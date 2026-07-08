import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Emprestimo } from '../emprestimo/emprestimo.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Emprestimo)
    private readonly emprestimoRepository: Repository<Emprestimo>,
  ) {}

  async livrosMaisEmprestados(instituicaoId: string) {
    const resultado = await this.emprestimoRepository
      .createQueryBuilder('emprestimo')
      .innerJoin('emprestimo.exemplar', 'exemplar')
      .innerJoin('exemplar.livro', 'livro')
      .where('livro.instituicao_id = :instituicaoId', { instituicaoId })
      .select('livro.id', 'livroId')
      .addSelect('livro.titulo', 'titulo')
      .addSelect('livro.autor', 'autor')
      .addSelect('COUNT(emprestimo.id)', 'totalEmprestimos')
      .groupBy('livro.id')
      .addGroupBy('livro.titulo')
      .addGroupBy('livro.autor')
      .orderBy('"totalEmprestimos"', 'DESC')
      .limit(5)
      .getRawMany();

    return resultado.map((r)=>({
        ...r,
        totalEmprestimos: Number(r.totalEmprestimos),
    }));
  }

  async generosMaisProcurados(instituicaoId: string, faixaEtaria?: string) {
  const query = this.emprestimoRepository
    .createQueryBuilder('emprestimo')
    .innerJoin('emprestimo.exemplar', 'exemplar')
    .innerJoin('exemplar.livro', 'livro')
    .innerJoin('livro_genero', 'livroGenero', 'livroGenero.livro_id = livro.id')
    .innerJoin('genero', 'genero', 'genero.id = livroGenero.genero_id')
    .where('livro.instituicao_id = :instituicaoId', { instituicaoId });

  if (faixaEtaria) {
    query.andWhere('livro.faixa_etaria = :faixaEtaria', { faixaEtaria });
  }

  const resultado = await query
    .select('genero.id', 'generoId')
    .addSelect('genero.nome', 'nome')
    .addSelect('COUNT(emprestimo.id)', 'totalEmprestimos')
    .groupBy('genero.id')
    .addGroupBy('genero.nome')
    .orderBy('"totalEmprestimos"', 'DESC')
    .getRawMany();

  return resultado.map((r) => ({
    ...r,
    totalEmprestimos: Number(r.totalEmprestimos),
  }));
}
async mediaLeitura(instituicaoId: string) {
  const agora = new Date();
  const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
  const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59);
  const [mesAtual, mesAnterior] = await Promise.all([
    this.emprestimoRepository
      .createQueryBuilder('emprestimo')
      .innerJoin('emprestimo.exemplar', 'exemplar')
      .innerJoin('exemplar.livro', 'livro')
      .where('livro.instituicao_id = :instituicaoId', { instituicaoId })

      .andWhere('emprestimo.data_retirada >= :inicio', { inicio: inicioMesAtual })
      .getCount(),

    this.emprestimoRepository
      .createQueryBuilder('emprestimo')
      .innerJoin('emprestimo.exemplar', 'exemplar')
      .innerJoin('exemplar.livro', 'livro')
      .where('livro.instituicao_id = :instituicaoId', { instituicaoId })
      
      .andWhere('emprestimo.data_retirada >= :inicio', { inicio: inicioMesAnterior })
      .andWhere('emprestimo.data_retirada <= :fim', { fim: fimMesAnterior })
      .getCount(),
  ]);

  const variacao =
    mesAnterior === 0
      ? null
      : Number((((mesAtual - mesAnterior) / mesAnterior) * 100).toFixed(1));

  return {
    mesAtual,
    mesAnterior,
    variacaoPercent: variacao,
  };
}
}