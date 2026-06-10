import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ClubeLivro } from './clube-livro.entity';
import { CreateClubeLivroDto } from './dto/create-clube-livro.dto';
import { UpdateClubeLivroDto } from './dto/update-clube-livro.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioService } from '../usuario/usuario.service';
import { LivroService } from '../livro/livro.service';
import { TipoPerfil } from '../usuario/usuario.entity'

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

     const professor = await this.usuarioService.findOne(professor_id);
    if (professor.perfil !== TipoPerfil.PROFESSOR) {
      throw new BadRequestException('Usuário não é professor');
    }

    const livro = await this.livroService.findOne(livro_id);
    if (livro.instituicao.id !== professor.instituicao.id) {
      throw new ForbiddenException('Livro não pertence à instituição do professor');
    }
 
    const clube = this.clubeLivroRepository.create({
      ...dadosClube,
      professor: { id: professor_id },
      livro: { id: livro_id },
    });
    return await this.clubeLivroRepository.save(clube);
  }

  async findAll(): Promise<ClubeLivro[]> {
    return await this.clubeLivroRepository.find({
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
}
