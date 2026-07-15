import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Livro } from './livro.entity';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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
}
