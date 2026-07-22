import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreferenciaGenero } from './preferencia-genero.entity';
import { CreatePreferenciaGeneroDto } from './dto/create-preferencia-genero.dto';

@Injectable()
export class PreferenciaGeneroService {
  constructor(
    @InjectRepository(PreferenciaGenero)
    private readonly preferenciaGeneroRepository: Repository<PreferenciaGenero>,
  ) {}

  async create(
    createPreferenciaGeneroDto: CreatePreferenciaGeneroDto,
  ): Promise<PreferenciaGenero> {
    const { usuario_id, genero_id, ...dadosPreferenciaGenero } =
      createPreferenciaGeneroDto;

    const preferencia_genero = this.preferenciaGeneroRepository.create({
      ...dadosPreferenciaGenero,
      usuario: { id: usuario_id },
      genero: { id: genero_id },
    });

    return await this.preferenciaGeneroRepository.save(preferencia_genero);
  }

  async findAll(usuarioId: string): Promise<PreferenciaGenero[]> {
    return await this.preferenciaGeneroRepository.find({
      where: {
        usuario: {
          id: usuarioId,
        },
      },
      relations: ['usuario', 'genero'],
    });
  }

  async findOne(id: string, usuarioId: string): Promise<PreferenciaGenero> {
    const preferencia_genero = await this.preferenciaGeneroRepository.findOne({
      where: {
        id,
        usuario: {
          id: usuarioId,
        },
      },
      relations: ['usuario', 'genero'],
    });
    if (!preferencia_genero)
      throw new NotFoundException('Preferência de gênero não encontrada');
    return preferencia_genero;
  }

  async remove(id: string, usuarioId: string): Promise<void> {
    const preferencia_genero = await this.findOne(id, usuarioId);
    await this.preferenciaGeneroRepository.remove(preferencia_genero);
  }

  async update(usuarioId: string, generosIds: string[]): Promise<void> {
    await this.preferenciaGeneroRepository.createQueryBuilder()
      .delete()
      .where("usuario_id = :usuarioId", { usuarioId })
      .execute();
    if (!generosIds || generosIds.length === 0) return;
    const idsUnicos = [...new Set(generosIds)];
    const novasPreferencias = idsUnicos.map(generoId => 
      this.preferenciaGeneroRepository.create({
        usuario: { id: usuarioId },
        genero: { id: generoId }
      })
    );
    await this.preferenciaGeneroRepository.save(novasPreferencias);
  }
}
