import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClubeLivro } from './clube-livro.entity';
import { CreateClubeLivroDto } from './dto/create-clube-livro.dto';
import { UpdateClubeLivroDto } from './dto/update-clube-livro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioService } from '../usuario/usuario.service';
import { LivroService } from '../livro/livro.service';
import { Usuario, TipoPerfil } from '../usuario/usuario.entity';
import { Livro } from '../livro/livro.entity';

@Injectable()
export class ClubeService {
  constructor(
    @InjectRepository(ClubeLivro)
    private readonly clubeLivroRepository: Repository<ClubeLivro>,
    private readonly usuarioService: UsuarioService,
    private readonly livroService: LivroService,
  ) {}

  async create(createClubeDto: CreateClubeLivroDto): Promise<ClubeLivro> {
    const { professor_id, livro_id, ...dadosClube } = createClubeDto;

    const professor = await this.validarProfessor(professor_id);
    const livro = await this.livroService.findOne(livro_id);
    this.validarInstituicaoLivro(livro, professor);

    const clube = this.clubeLivroRepository.create({
      ...dadosClube,
      professor: { id: professor_id },
      livro: { id: livro_id },
    });
    return await this.clubeLivroRepository.save(clube);
  }

  async findAll(instituicao_id: string): Promise<ClubeLivro[]> {
    return await this.clubeLivroRepository.find({
      where: { professor: { instituicao: { id: instituicao_id } } },
      relations: ['professor', 'livro'],
    });
  }

  async findOne(id: string): Promise<ClubeLivro> {
    const clube = await this.clubeLivroRepository.findOne({
      where: { id },
      relations: ['professor', 'livro'],
    });

    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }
    return clube;
  }

  async update(
    id: string,
    updateClubeLivroDto: UpdateClubeLivroDto,
  ): Promise<ClubeLivro> {
    const clube = await this.findOne(id);

    this.clubeLivroRepository.merge(clube, updateClubeLivroDto);
    return await this.clubeLivroRepository.save(clube);
  }

  async remove(id: string): Promise<void> {
    const clube = await this.findOne(id);
    await this.clubeLivroRepository.remove(clube);
  }

  private async validarProfessor(professorId: string): Promise<Usuario> {
    const professor = await this.usuarioService.findOne(professorId);

    if (professor.perfil !== TipoPerfil.PROFESSOR) {
      throw new BadRequestException('Usuário não é professor');
    }

    return professor;
  }

  private validarInstituicaoLivro(livro: Livro, professor: Usuario): void {
    if (livro.instituicao.id !== professor.instituicao.id) {
      throw new ForbiddenException(
        'Livro não pertence à instituição do professor',
      );
    }
  }
}
