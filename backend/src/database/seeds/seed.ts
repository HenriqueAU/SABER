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

function diasAtras(dias: number): Date {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

function diasAfrente(dias: number): Date {
  return new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
}

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
      nome: 'Escola Estadual SABER',
      tipo: TipoInstituicao.ESCOLA,
      cidade: 'Goiás',
      estado: 'GO',
    }),
  );

  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash('Senha@123', salt);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const gestor = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Carlos Gestor',
      email: 'perfil.gestor@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.GESTOR,
      data_nasc: new Date('1978-03-15'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bibliotecario = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Fernanda Bibliotecária',
      email: 'perfil.bibliotecario@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.BIBLIOTECARIO,
      data_nasc: new Date('1990-07-22'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
  );

  const professor = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Roberto Professor',
      email: 'perfil.professor@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.PROFESSOR,
      data_nasc: new Date('1982-11-05'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
  );

  const alunosDados = [
    {
      nome: 'Ana Silva',
      email: 'aluno1@email.com',
      nasc: new Date('2013-04-10'),
    },
    {
      nome: 'Bruno Costa',
      email: 'aluno2@email.com',
      nasc: new Date('2012-08-20'),
    },
    {
      nome: 'Carla Mendes',
      email: 'aluno3@email.com',
      nasc: new Date('2009-01-15'),
    },
    {
      nome: 'Diego Souza',
      email: 'aluno4@email.com',
      nasc: new Date('2008-06-30'),
    },
    {
      nome: 'Eduarda Lima',
      email: 'aluno5@email.com',
      nasc: new Date('2007-09-12'),
    },
    {
      nome: 'Felipe Rocha',
      email: 'aluno6@email.com',
      nasc: new Date('2003-02-28'),
    },
    {
      nome: 'Gabriela Nunes',
      email: 'aluno7@email.com',
      nasc: new Date('2001-11-03'),
    },
    {
      nome: 'Henrique Alves',
      email: 'aluno8@email.com',
      nasc: new Date('1998-07-17'),
    },
    {
      nome: 'Isabela Ferreira',
      email: 'aluno9@email.com',
      nasc: new Date('1996-03-25'),
    },
    {
      nome: 'João Martins',
      email: 'aluno10@email.com',
      nasc: new Date('1983-12-01'),
    },
  ];

  const alunos = await usuarioRepo.save(
    alunosDados.map((a) =>
      usuarioRepo.create({
        nome: a.nome,
        email: a.email,
        senha_hash: senhaHash,
        perfil: TipoPerfil.ALUNO,
        data_nasc: a.nasc,
        instituicao: { id: instituicao.id },
        ativo: true,
      }),
    ),
  );

  const nomeGeneros = [
    'Ficção Científica',
    'Aventura',
    'Romance',
    'História',
    'Filosofia',
    'Fantasia',
    'Tecnologia',
    'Biografias',
  ];

  const generos = await generoRepo.save(
    nomeGeneros.map((nome) => generoRepo.create({ nome })),
  );

  const [
    ficcao,
    aventura,
    romance,
    historia,
    filosofia,
    fantasia,
    tecnologia,
    biografias,
  ] = generos;

  const prefsData = [
    { aluno: alunos[0], genero: fantasia },
    { aluno: alunos[1], genero: aventura },
    { aluno: alunos[2], genero: ficcao },
    { aluno: alunos[3], genero: ficcao },
    { aluno: alunos[4], genero: romance },
    { aluno: alunos[5], genero: tecnologia },
    { aluno: alunos[6], genero: ficcao },
    { aluno: alunos[7], genero: historia },
    { aluno: alunos[8], genero: romance },
    { aluno: alunos[9], genero: biografias },
  ];

  await preferenciaGeneroRepo.save(
    prefsData.map((p) =>
      preferenciaGeneroRepo.create({
        usuario: { id: p.aluno.id },
        genero: { id: p.genero.id },
      }),
    ),
  );

  const livrosDados = [
    {
      titulo: 'Duna',
      autor: 'Frank Herbert',
      isbn: '9780441013593',
      generos: [ficcao, aventura],
    },
    {
      titulo: '1984',
      autor: 'George Orwell',
      isbn: '9780451524935',
      generos: [ficcao],
    },
    {
      titulo: 'Admirável Mundo Novo',
      autor: 'Aldous Huxley',
      isbn: '9780060850524',
      generos: [ficcao],
    },
    {
      titulo: 'O Senhor dos Anéis',
      autor: 'J.R.R. Tolkien',
      isbn: '9780618640157',
      generos: [fantasia, aventura],
    },
    {
      titulo: 'Harry Potter',
      autor: 'J.K. Rowling',
      isbn: '9780439708180',
      generos: [fantasia, aventura],
    },
    {
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
      isbn: '9788535902778',
      generos: [romance],
    },
    {
      titulo: 'A Culpa é das Estrelas',
      autor: 'John Green',
      isbn: '9788580577556',
      generos: [romance],
    },
    {
      titulo: 'Sapiens',
      autor: 'Yuval Noah Harari',
      isbn: '9780062316097',
      generos: [historia, biografias],
    },
    {
      titulo: 'O Mundo de Sofia',
      autor: 'Jostein Gaarder',
      isbn: '9788522500000',
      generos: [filosofia],
    },
    {
      titulo: 'A Rebelião das Massas',
      autor: 'José Ortega y Gasset',
      isbn: null,
      generos: [filosofia],
    },
    {
      titulo: 'Fundação',
      autor: 'Isaac Asimov',
      isbn: '9780553293357',
      generos: [ficcao, tecnologia],
    },
    {
      titulo: 'O Guia do Mochileiro',
      autor: 'Douglas Adams',
      isbn: '9780345391803',
      generos: [ficcao, aventura],
    },
  ];

  const livros = await livroRepo.save(
    livrosDados.map((l) =>
      livroRepo.create({
        titulo: l.titulo,
        autor: l.autor,
        isbn: l.isbn ?? undefined,
        instituicao: { id: instituicao.id },
      }),
    ),
  );

  const livroGeneroEntries: LivroGenero[] = [];
  for (let i = 0; i < livros.length; i++) {
    for (const genero of livrosDados[i].generos) {
      livroGeneroEntries.push(
        livroGeneroRepo.create({
          livro: { id: livros[i].id },
          genero: { id: genero.id },
        }),
      );
    }
  }
  await livroGeneroRepo.save(livroGeneroEntries);

  const exemplaresEntries: Exemplar[] = [];
  for (let i = 0; i < livros.length; i++) {
    const qtd = i % 3 === 0 ? 3 : 2;
    for (let j = 1; j <= qtd; j++) {
      exemplaresEntries.push(
        exemplarRepo.create({
          codigo: `EX-${String(i + 1).padStart(2, '0')}-${j}`,
          status: StatusExemplar.DISPONIVEL,
          livro: { id: livros[i].id },
        }),
      );
    }
  }
  const exemplares = await exemplarRepo.save(exemplaresEntries);

  const empr = async (
    exemplarIdx: number,
    alunoIdx: number,
    retiradaHa: number,
    devolucaoEsperadaEm: number,
    devolvido: boolean,
    devolucaoEfetivaHa?: number,
  ) => {
    const exemplar = exemplares[exemplarIdx];
    const usuario = alunos[alunoIdx];
    const data_retirada = diasAtras(retiradaHa);
    const data_devolucao_esperada = diasAtras(retiradaHa - devolucaoEsperadaEm);
    const data_devolucao_efetiva = devolvido
      ? diasAtras(devolucaoEfetivaHa ?? 1)
      : undefined;

    await emprestimoRepo.save(
      emprestimoRepo.create({
        exemplar: { id: exemplar.id },
        usuario: { id: usuario.id },
        data_retirada,
        data_devolucao_esperada,
        data_devolucao_efetiva,
      }),
    );

    if (!devolvido) {
      await exemplarRepo.update(exemplar.id, {
        status: StatusExemplar.EMPRESTADO,
      });
    }
  };

  await empr(0, 0, 85, 14, true, 71);
  await empr(2, 1, 80, 14, true, 66);
  await empr(4, 2, 75, 14, true, 62);
  await empr(6, 3, 70, 14, true, 57);
  await empr(8, 4, 65, 14, true, 52);
  await empr(10, 5, 60, 14, true, 47);
  await empr(12, 6, 55, 14, true, 42);
  await empr(14, 7, 50, 14, true, 37);
  await empr(16, 8, 45, 14, true, 32);
  await empr(18, 9, 40, 14, true, 27);
  await empr(1, 0, 35, 14, true, 22);
  await empr(3, 1, 30, 14, true, 17);
  await empr(5, 2, 25, 14, true, 12);
  await empr(7, 3, 20, 14, true, 7);
  await empr(9, 4, 15, 14, true, 2);

  await empr(11, 5, 10, 14, false);
  await empr(13, 6, 8, 14, false);
  await empr(15, 7, 5, 14, false);
  await empr(17, 8, 3, 14, false);

  await empr(19, 9, 20, 7, false);
  await empr(20, 0, 18, 7, false);
  await empr(21, 1, 16, 7, false);

  const clube1 = await clubeLivroRepo.save(
    clubeLivroRepo.create({
      nome: 'Clube de Ficção Científica',
      professor: { id: professor.id },
      livro: { id: livros[0].id },
      ativo: true,
      data_inicio: diasAtras(30),
      data_fim: diasAfrente(30),
      local_encontro: 'Biblioteca Principal',
    }),
  );

  const clube2 = await clubeLivroRepo.save(
    clubeLivroRepo.create({
      nome: 'Clube de Fantasia',
      professor: { id: professor.id },
      livro: { id: livros[3].id },
      ativo: true,
      data_inicio: diasAtras(15),
      data_fim: diasAfrente(45),
      local_encontro: 'Sala de Leitura B',
    }),
  );

  const clube3 = await clubeLivroRepo.save(
    clubeLivroRepo.create({
      nome: 'Clube de Filosofia',
      professor: { id: professor.id },
      livro: { id: livros[9].id },
      ativo: false,
      data_inicio: diasAtras(90),
      data_fim: diasAtras(10),
      local_encontro: 'Biblioteca Principal',
    }),
  );

  const membrosClube1 = await membroClubeRepo.save([
    membroClubeRepo.create({
      clube: { id: clube1.id },
      usuario: { id: alunos[2].id },
      status: StatusMembro.CONFIRMADO,
    }),
    membroClubeRepo.create({
      clube: { id: clube1.id },
      usuario: { id: alunos[3].id },
      status: StatusMembro.CONFIRMADO,
    }),
    membroClubeRepo.create({
      clube: { id: clube1.id },
      usuario: { id: alunos[5].id },
      status: StatusMembro.CONFIRMADO,
    }),
    membroClubeRepo.create({
      clube: { id: clube1.id },
      usuario: { id: alunos[6].id },
      status: StatusMembro.CONFIRMADO,
    }),
    membroClubeRepo.create({
      clube: { id: clube1.id },
      usuario: { id: alunos[7].id },
      status: StatusMembro.CONFIRMADO,
    }),
  ]);

  const membrosClube2 = await membroClubeRepo.save([
    membroClubeRepo.create({
      clube: { id: clube2.id },
      usuario: { id: alunos[0].id },
      status: StatusMembro.CONFIRMADO,
    }),
    membroClubeRepo.create({
      clube: { id: clube2.id },
      usuario: { id: alunos[1].id },
      status: StatusMembro.CONFIRMADO,
    }),
    membroClubeRepo.create({
      clube: { id: clube2.id },
      usuario: { id: alunos[4].id },
      status: StatusMembro.CONFIRMADO,
    }),
  ]);

  const membrosClube3 = await membroClubeRepo.save([
    membroClubeRepo.create({
      clube: { id: clube3.id },
      usuario: { id: alunos[8].id },
      status: StatusMembro.CONFIRMADO,
    }),
    membroClubeRepo.create({
      clube: { id: clube3.id },
      usuario: { id: alunos[9].id },
      status: StatusMembro.CONFIRMADO,
    }),
  ]);

  const pergunta1 = await perguntaRepo.save(
    perguntaRepo.create({ texto: 'Qual é o seu gênero literário favorito?' }),
  );

  const pergunta2 = await perguntaRepo.save(
    perguntaRepo.create({ texto: 'Como avalia a leitura do mês?' }),
  );

  const itensPergunta1 = await itemPerguntaRepo.save([
    itemPerguntaRepo.create({
      pergunta: { id: pergunta1.id },
      texto: 'Ficção Científica',
    }),
    itemPerguntaRepo.create({
      pergunta: { id: pergunta1.id },
      texto: 'Fantasia',
    }),
    itemPerguntaRepo.create({
      pergunta: { id: pergunta1.id },
      texto: 'Romance',
    }),
    itemPerguntaRepo.create({
      pergunta: { id: pergunta1.id },
      texto: 'Filosofia',
    }),
    itemPerguntaRepo.create({
      pergunta: { id: pergunta1.id },
      texto: 'Aventura',
    }),
  ]);

  const itensPergunta2 = await itemPerguntaRepo.save([
    itemPerguntaRepo.create({
      pergunta: { id: pergunta2.id },
      texto: 'Excelente',
    }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta2.id }, texto: 'Boa' }),
    itemPerguntaRepo.create({
      pergunta: { id: pergunta2.id },
      texto: 'Regular',
    }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta2.id }, texto: 'Ruim' }),
  ]);

  await respostaMembroRepo.save([
    respostaMembroRepo.create({
      membro: { id: membrosClube1[0].id },
      itemPergunta: { id: itensPergunta1[0].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[0].id },
      itemPergunta: { id: itensPergunta2[0].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[1].id },
      itemPergunta: { id: itensPergunta1[0].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[1].id },
      itemPergunta: { id: itensPergunta2[1].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[2].id },
      itemPergunta: { id: itensPergunta1[4].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[2].id },
      itemPergunta: { id: itensPergunta2[0].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[3].id },
      itemPergunta: { id: itensPergunta1[0].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[3].id },
      itemPergunta: { id: itensPergunta2[2].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[4].id },
      itemPergunta: { id: itensPergunta1[1].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube1[4].id },
      itemPergunta: { id: itensPergunta2[1].id },
    }),
  ]);

  await respostaMembroRepo.save([
    respostaMembroRepo.create({
      membro: { id: membrosClube2[0].id },
      itemPergunta: { id: itensPergunta1[1].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube2[0].id },
      itemPergunta: { id: itensPergunta2[0].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube2[1].id },
      itemPergunta: { id: itensPergunta1[1].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube2[1].id },
      itemPergunta: { id: itensPergunta2[1].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube2[2].id },
      itemPergunta: { id: itensPergunta1[2].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube2[2].id },
      itemPergunta: { id: itensPergunta2[0].id },
    }),
  ]);

  await respostaMembroRepo.save([
    respostaMembroRepo.create({
      membro: { id: membrosClube3[0].id },
      itemPergunta: { id: itensPergunta1[3].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube3[0].id },
      itemPergunta: { id: itensPergunta2[1].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube3[1].id },
      itemPergunta: { id: itensPergunta1[3].id },
    }),
    respostaMembroRepo.create({
      membro: { id: membrosClube3[1].id },
      itemPergunta: { id: itensPergunta2[2].id },
    }),
  ]);

  console.log('Seed concluído com sucesso.');
  await AppDataSource.destroy();
}

void seed();
