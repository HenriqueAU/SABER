import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Livro } from './livro.entity';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PreferenciaGenero } from '../preferencia_genero/preferencia-genero.entity';
import { Emprestimo } from '../emprestimo/emprestimo.entity';
import { LivroGenero } from '../livro_genero/livro-genero.entity';

interface OpenLibraryLivro {
  title?: string;
  authors?: { name: string }[];
  cover?: { small?: string; medium?: string; large?: string };
  publishers?: { name: string }[];
  publish_date?: string;
  number_of_pages?: number;
}

interface OpenLibraryResponse {
  [key: string]: OpenLibraryLivro;
}

@Injectable()
export class LivroService {
  constructor(
    @InjectRepository(Livro)
    private readonly livroRepository: Repository<Livro>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(createLivroDto: CreateLivroDto): Promise<Livro> {
    const { instituicao_id, ...dadosLivro } = createLivroDto;

    const livro = this.livroRepository.create({
      ...dadosLivro,
      instituicao: { id: instituicao_id },
    });

    return await this.livroRepository.save(livro);
  }

  async findAll(instituicao_id: string): Promise<Livro[]> {
    return await this.livroRepository.find({
      where: { instituicao: { id: instituicao_id } },
      relations: ['instituicao'],
    });
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

  async buscarPorIsbn(isbn: string) {
    const baseUrl = this.configService.get<string>('OPEN_LIBRARY_BASE_URL');
    const url = `${baseUrl}/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`;

    const { data } = await firstValueFrom(
      this.httpService.get<OpenLibraryResponse>(url),
    );

    const chave = `ISBN:${isbn}`;
    const livroEncontrado = data[chave];

    if (!livroEncontrado) {
      throw new NotFoundException('Livro não encontrado para este ISBN');
    }

    return {
      titulo: livroEncontrado.title ?? null,
      autor: livroEncontrado.authors?.[0]?.name ?? null,
      capa_url:
        livroEncontrado.cover?.large ?? livroEncontrado.cover?.medium ?? null,
      editora: livroEncontrado.publishers?.[0]?.name ?? null,
      publicado_em: livroEncontrado.publish_date ?? null,
      paginas: livroEncontrado.number_of_pages ?? null,
    };
  }

  async obterRecomendacoesAluno(usuarioId: string, instituicaoId: string): Promise<Livro[]> {
    const manager = this.livroRepository.manager;

    const preferencias = await manager.find(PreferenciaGenero, {
      where: { usuario: { id: usuarioId } },
      relations: ['genero']
    });

    const pontuacaoGeneros = new Map<string, number>();
    preferencias.forEach(p => {
      if (p.genero) pontuacaoGeneros.set(p.genero.id, 10);
    });

    const historico = await manager.createQueryBuilder(Emprestimo, 'emp')
      .innerJoin('emp.exemplar', 'ex')
      .innerJoin('ex.livro', 'livro')
      .innerJoin(LivroGenero, 'lg', 'lg.livro_id = livro.id')
      .select([
        'lg.genero_id AS genero_id',
        'ex.livro_id AS livro_id',
        'emp.data_devolucao_efetiva AS data_devolucao'
      ])
      .where('emp.usuario_id = :usuarioId', { usuarioId })
      .getRawMany();

    const livrosLidosIds = new Set<string>();
    const HOJE = new Date().getTime();

    // Multiplica os pontos baseado no quão recente é a devolução
    historico.forEach(h => {
      livrosLidosIds.add(h.livro_id); // Adiciona na blacklist

      const genId = h.genero_id;
      let pontos = pontuacaoGeneros.get(genId) || 0;

      if (h.data_devolucao) {
        
        const diasAtras = (HOJE - new Date(h.data_devolucao).getTime()) / (1000 * 3600 * 24);
        if (diasAtras <= 30) pontos += 3;
        else if (diasAtras <= 90) pontos += 2;
        else pontos += 1;
      } else {
        
        pontos += 4;
      }
      pontuacaoGeneros.set(genId, pontos);
    });
    
    const qb = this.livroRepository.createQueryBuilder('livro')
      .leftJoin(LivroGenero, 'lg', 'lg.livro_id = livro.id')
      .where('livro.instituicao_id = :instituicaoId', { instituicaoId });

    // Remove os livros que já leu ou está lendo
    if (livrosLidosIds.size > 0) {
      qb.andWhere('livro.id NOT IN (:...ids)', { ids: Array.from(livrosLidosIds) });
    }

    if (pontuacaoGeneros.size > 0) {
      let caseSql = '0';
      for (const [genId, score] of pontuacaoGeneros.entries()) {
        caseSql += ` + CASE WHEN lg.genero_id = '${genId}' THEN ${score} ELSE 0 END`;
      }
      qb.addSelect(`SUM(${caseSql})`, 'pontuacao')
        .groupBy('livro.id')
        .having(`SUM(${caseSql}) > 0`)
        .orderBy('pontuacao', 'DESC');
    }

    // Recomenda 10 matches com o perfil
    qb.limit(10);
    const { entities: recomendados } = await qb.getRawAndEntities();

    // Adiciona 2 livros fora da bolha
    let resultadoFinal = [...recomendados];
    if (resultadoFinal.length < 12) {
      const idsIgnorar = [...Array.from(livrosLidosIds), ...resultadoFinal.map(l => l.id)];

      const qbAleatorio = this.livroRepository.createQueryBuilder('livro')
        .where('livro.instituicao_id = :instituicaoId', { instituicaoId });

      if (idsIgnorar.length > 0) {
        qbAleatorio.andWhere('livro.id NOT IN (:...ids)', { ids: idsIgnorar });
      }

      qbAleatorio.orderBy('livro.created_at', 'DESC')
                .limit(12 - resultadoFinal.length);

      const descobertas = await qbAleatorio.getMany();
      resultadoFinal = [...resultadoFinal, ...descobertas];
    }
    
    // injeta os generos nos livros recomendados para aparecer no frontend
    if (resultadoFinal.length > 0) {
      const idsRecomendados = resultadoFinal.map(l => l.id);
      
      const generosDosLivros = await manager.find(LivroGenero, {
        where: { livro: { id: In(idsRecomendados) } },
        relations: ['livro', 'genero']
      });

      const recomendadosComGeneros = resultadoFinal.map(livro => {
        const nomesDosGeneros = generosDosLivros
          .filter(lg => lg.livro.id === livro.id && lg.genero)
          .map(lg => lg.genero.nome);

        return {
          ...livro,
          generos: nomesDosGeneros
        };
      });
      return recomendadosComGeneros;
    }
    return resultadoFinal;
  }
}
