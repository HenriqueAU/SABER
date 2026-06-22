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
import { ClubeLivro } from '../../modules/clube_livro/clube-livro.entity';
import { Emprestimo } from '../../modules/emprestimo/emprestimo.entity';
import {
  MembroClube,
  StatusMembro,
} from '../../modules/membro_clube/membro-clube.entity';
import { Pergunta } from '../../modules/pergunta/pergunta.entity';
import { ItemPergunta } from '../../modules/item_pergunta/item-pergunta.entity';
import { PreferenciaGenero } from '../../modules/preferencia_genero/preferencia-genero.entity';
import { RespostaMembro } from '../../modules/resposta_membro/resposta-membro.entity';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  const instituicaoRepo = AppDataSource.getRepository(Instituicao);
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const generoRepo = AppDataSource.getRepository(Genero);
  const livroRepo = AppDataSource.getRepository(Livro);
  const livroGeneroRepo = AppDataSource.getRepository(LivroGenero);
  const exemplarRepo = AppDataSource.getRepository(Exemplar);
  const clubeLivroRepo = AppDataSource.getRepository(ClubeLivro);
  const emprestimoRepo = AppDataSource.getRepository(Emprestimo);
  const membroClubeRepo = AppDataSource.getRepository(MembroClube);
  const perguntaRepo = AppDataSource.getRepository(Pergunta);
  const itemPerguntaRepo = AppDataSource.getRepository(ItemPergunta);
  const preferenciaGeneroRepo = AppDataSource.getRepository(PreferenciaGenero);
  const respostaMembroRepo = AppDataSource.getRepository(RespostaMembro);

  const instituicao = await instituicaoRepo.save(
    instituicaoRepo.create({
      nome: 'Escola Exemplo',
      tipo: TipoInstituicao.ESCOLA,
    }),
  );

  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash('senhateste123', salt);

  const usuarios = await usuarioRepo.save([
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

  const aluno = usuarios[0];
  const professor = usuarios[1];

  const filosofia = await generoRepo.save(
    generoRepo.create({ nome: 'Filosofia' }),
  );
  const romance = await generoRepo.save(generoRepo.create({ nome: 'Romance' }));

  await preferenciaGeneroRepo.save([
    preferenciaGeneroRepo.create({
      usuario: { id: aluno.id },
      genero: { id: filosofia.id },
    }),
    preferenciaGeneroRepo.create({
      usuario: { id: professor.id },
      genero: { id: romance.id },
    }),
  ]);

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

  const exemplares = await exemplarRepo.save([
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

  await emprestimoRepo.save([
    emprestimoRepo.create({
      exemplar: { id: exemplares[0].id },
      usuario: { id: aluno.id },
      data_retirada: new Date(),
      data_devolucao_esperada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }),
  ]);

  await exemplarRepo.update(exemplares[0].id, { status: StatusExemplar.EMPRESTADO });

  const clube = await clubeLivroRepo.save(
    clubeLivroRepo.create({
      nome: 'Clube de Leitura de Filosofia',
      professor: { id: professor.id },
      livro: { id: livroOrtega.id },
      ativo: true,
      data_inicio: new Date(),
      local_encontro: 'Biblioteca Principal',
    }),
  );

  const membro = await membroClubeRepo.save(
    membroClubeRepo.create({
      clube: { id: clube.id },
      usuario: { id: aluno.id },
      status: StatusMembro.CONFIRMADO,
    }),
  );

  const pergunta = await perguntaRepo.save(
    perguntaRepo.create({
      texto: 'Qual é o seu gênero literário favorito?',
    }),
  );

  const itensPergunta = await itemPerguntaRepo.save([
    itemPerguntaRepo.create({
      pergunta: { id: pergunta.id },
      texto: 'Romance',
    }),
    itemPerguntaRepo.create({
      pergunta: { id: pergunta.id },
      texto: 'Filosofia',
    }),
  ]);

  await respostaMembroRepo.save(
    respostaMembroRepo.create({
      membro: { id: membro.id },
      itemPergunta: { id: itensPergunta[1].id },
    }),
  );

  console.log('Seed concluído com sucesso.');
  await AppDataSource.destroy();
}

void seed();
