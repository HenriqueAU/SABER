import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../config/database.config';
import {
  Instituicao,
  TipoInstituicao,
} from '../../modules/instituicao/instituicao.entity';
import { Usuario, TipoPerfil } from '../../modules/usuario/usuario.entity';
import { Genero } from '../../modules/genero/genero.entity';
import { Livro } from '../../modules/livro/livro.entity';
import { LivroGenero } from '../../modules/livro_genero/livro-genero.entity';
import {
  Exemplar,
  StatusExemplar,
} from '../../modules/exemplar/exemplar.entity';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const instituicaoRepo = AppDataSource.getRepository(Instituicao);
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const generoRepo = AppDataSource.getRepository(Genero);
  const livroRepo = AppDataSource.getRepository(Livro);
  const livroGeneroRepo = AppDataSource.getRepository(LivroGenero);
  const exemplarRepo = AppDataSource.getRepository(Exemplar);

  const instituicao = await instituicaoRepo.save(
    instituicaoRepo.create({
      nome: 'Escola Exemplo',
      tipo: TipoInstituicao.ESCOLA,
    }),
  );

  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash('senhateste123', salt);

  await usuarioRepo.save([
    usuarioRepo.create({
      nome: 'Aluno Teste',
      email: 'perfil.aluno@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.ALUNO,
      data_nasc: new Date('2005-01-01'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
    usuarioRepo.create({
      nome: 'Professor Teste',
      email: 'perfil.professor@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.PROFESSOR,
      data_nasc: new Date('1985-01-01'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
    usuarioRepo.create({
      nome: 'Gestor Teste',
      email: 'perfil.gestor@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.GESTOR,
      data_nasc: new Date('1980-01-01'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
    usuarioRepo.create({
      nome: 'Bibliotecário Teste',
      email: 'perfil.bibliotecario@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.BIBLIOTECARIO,
      data_nasc: new Date('1990-01-01'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
  ]);

  const filosofia = await generoRepo.save(
    generoRepo.create({ nome: 'Filosofia' }),
  );
  const romance = await generoRepo.save(generoRepo.create({ nome: 'Romance' }));

  const livroOrtega = await livroRepo.save(
    livroRepo.create({
      titulo: 'A Rebelião das Massas',
      autor: 'José Ortega y Gasset',
      instituicao: { id: instituicao.id },
    }),
  );

  const livroCulpa = await livroRepo.save(
    livroRepo.create({
      titulo: 'A Culpa é das Estrelas',
      autor: 'John Green',
      isbn: '9788580577556',
      instituicao: { id: instituicao.id },
    }),
  );

  await livroGeneroRepo.save([
    livroGeneroRepo.create({
      livro: { id: livroOrtega.id },
      genero: { id: filosofia.id },
    }),
    livroGeneroRepo.create({
      livro: { id: livroCulpa.id },
      genero: { id: romance.id },
    }),
  ]);

  await exemplarRepo.save([
    exemplarRepo.create({
      codigo: 'EX-001',
      status: StatusExemplar.DISPONIVEL,
      livro: { id: livroOrtega.id },
    }),
    exemplarRepo.create({
      codigo: 'EX-002',
      status: StatusExemplar.DISPONIVEL,
      livro: { id: livroCulpa.id },
    }),
  ]);

  console.log('Seed concluído com sucesso.');
  await AppDataSource.destroy();
}

void seed();
