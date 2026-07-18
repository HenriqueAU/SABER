/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
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


function nasc(idadeAnos: number, indice: number): Date {
  const hoje = new Date();
  const mes = indice % 12;
  const dia = 3 + (indice % 25);
  return new Date(hoje.getFullYear() - idadeAnos, mes, dia);
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

  const professor1 = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Roberto Professor',
      email: 'perfil.professor1@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.PROFESSOR,
      data_nasc: new Date('1982-11-05'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
  );

  const professor2 = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Marina Professora',
      email: 'perfil.professor2@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.PROFESSOR,
      data_nasc: new Date('1987-05-19'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
  );

  const faixas = [
    { min: 1, max: 12 },
    { min: 13, max: 17 },
    { min: 18, max: 25 },
    { min: 26, max: 40 },
    { min: 41, max: 65 },
  ];

  const primeirosNomes = [
    'Ana', 'Bruno', 'Carla', 'Diego', 'Eduarda', 'Felipe', 'Gabriela',
    'Henrique', 'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas',
    'Olívia', 'Pedro', 'Quésia', 'Rafael', 'Sabrina', 'Thiago', 'Ursula',
    'Vitor', 'Wesley', 'Yasmin', 'Zoe', 'Alice', 'Bernardo', 'Camila',
    'Daniel', 'Elisa',
  ];
  const sobrenomes = [
    'Silva', 'Costa', 'Mendes', 'Souza', 'Lima', 'Rocha', 'Nunes', 'Alves',
    'Ferreira', 'Martins', 'Pereira', 'Carvalho', 'Gomes', 'Ribeiro',
    'Barbosa', 'Cardoso', 'Teixeira', 'Correia', 'Dias', 'Moreira',
  ];

  const alunosDados: { nome: string; email: string; nasc: Date }[] = [];
  for (let i = 0; i < 60; i++) {
    const faixaIdx = Math.floor(i / 12);
    const { min, max } = faixas[faixaIdx];
    const localIdx = i % 12;
    const idade = min + (localIdx % (max - min + 1));

    alunosDados.push({
      nome: `${primeirosNomes[i % primeirosNomes.length]} ${sobrenomes[(i * 7 + 3) % sobrenomes.length]}`,
      email: `aluno${i + 1}@email.com`,
      nasc: nasc(idade, i),
    });
  }

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
    'Terror',
    'Poesia',
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
    terror,
    poesia,
  ] = generos;

  await preferenciaGeneroRepo.save(
    alunos.map((aluno, i) =>
      preferenciaGeneroRepo.create({
        usuario: { id: aluno.id },
        genero: { id: generos[i % generos.length].id },
      }),
    ),
  );

  const livrosDados: {
    titulo: string;
    autor: string;
    paginas: number;
    isbn?: string;
    generos: Genero[];
  }[] = [
    { titulo: 'Duna', autor: 'Frank Herbert', paginas: 688, isbn: '9788576573135', generos: [ficcao, aventura] },
    { titulo: '1984', autor: 'George Orwell', paginas: 328, isbn: '9786555522266', generos: [ficcao] },
    { titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley', paginas: 312, isbn: '9788525056009', generos: [ficcao] },
    { titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', paginas: 1178, isbn: '9788595084759', generos: [fantasia, aventura] },
    { titulo: 'Harry Potter e a Pedra Filosofal', autor: 'J.K. Rowling', paginas: 223, isbn: '9788532511010', generos: [fantasia, aventura] },
    { titulo: 'Dom Casmurro', autor: 'Machado de Assis', paginas: 256, isbn: '9781324090717', generos: [romance] },
    { titulo: 'A Culpa é das Estrelas', autor: 'John Green', paginas: 288, isbn: '9788580572261', generos: [romance] },
    { titulo: 'Sapiens: Uma Breve História da Humanidade', autor: 'Yuval Noah Harari', paginas: 464, isbn: '9788535933925', generos: [historia, biografias] },
    { titulo: 'O Mundo de Sofia', autor: 'Jostein Gaarder', paginas: 560, isbn: '9789722319492', generos: [filosofia] },
    { titulo: 'A Rebelião das Massas', autor: 'José Ortega y Gasset', paginas: 240, generos: [filosofia] },
    { titulo: 'Fundação', autor: 'Isaac Asimov', paginas: 296, isbn: '9788576570660', generos: [ficcao, tecnologia] },
    { titulo: 'O Guia do Mochileiro das Galáxias', autor: 'Douglas Adams', paginas: 224, isbn: '9788599296578', generos: [ficcao, aventura] },

    { titulo: 'Neuromancer', autor: 'William Gibson', paginas: 312, isbn: '9780441007462', generos: [ficcao, tecnologia] },
    { titulo: 'Frankenstein', autor: 'Mary Shelley', paginas: 280, isbn: '9789589127568', generos: [terror, ficcao] },
    { titulo: 'Drácula', autor: 'Bram Stoker', paginas: 418, isbn: '9780141439846', generos: [terror] },
    { titulo: 'O Iluminado', autor: 'Stephen King', paginas: 512, isbn: '9788581050485', generos: [terror] },
    { titulo: 'It: A Coisa', autor: 'Stephen King', paginas: 1104, isbn: '9788560280940', generos: [terror] },
    { titulo: 'Percy Jackson e o Ladrão de Raios', autor: 'Rick Riordan', paginas: 375, isbn: '9788580575392', generos: [fantasia, aventura] },
    { titulo: 'As Crônicas de Nárnia: O Leão, a Feiticeira e o Guarda-Roupa', autor: 'C.S. Lewis', paginas: 206, isbn: '9788578272647', generos: [fantasia, aventura] },
    { titulo: 'Orgulho e Preconceito', autor: 'Jane Austen', paginas: 352, isbn: '9788563560155', generos: [romance] },
    { titulo: 'E o Vento Levou', autor: 'Margaret Mitchell', paginas: 1037, isbn: '9788577994304', generos: [romance, historia] },
    { titulo: 'Como Água para Chocolate', autor: 'Laura Esquivel', paginas: 246, isbn: '9780385721233', generos: [romance] },
    { titulo: 'Uma Breve História do Tempo', autor: 'Stephen Hawking', paginas: 256, isbn: '9788580576467', generos: [tecnologia, filosofia] },
    { titulo: 'Cosmos', autor: 'Carl Sagan', paginas: 396, isbn: '9780345539434', generos: [tecnologia, historia] },
    { titulo: 'A Origem das Espécies', autor: 'Charles Darwin', paginas: 528, isbn: '9788572329859', generos: [historia, tecnologia] },
    { titulo: 'Steve Jobs', autor: 'Walter Isaacson', paginas: 656, isbn: '9781982176860', generos: [biografias] },
    { titulo: 'Einstein: Sua Vida, Seu Universo', autor: 'Walter Isaacson', paginas: 704, isbn: '9788535911282', generos: [biografias] },
    { titulo: 'O Diário de Anne Frank', autor: 'Anne Frank', paginas: 352, isbn: '9788501044457', generos: [biografias, historia] },
    { titulo: 'O Príncipe', autor: 'Nicolau Maquiavel', paginas: 160, isbn: '8563560034', generos: [filosofia, historia] },
    { titulo: 'Assim Falou Zaratustra', autor: 'Friedrich Nietzsche', paginas: 352, isbn: '9788572328562', generos: [filosofia] },
    { titulo: 'Meditações', autor: 'Marco Aurélio', paginas: 256, isbn: '9786587885339', generos: [filosofia] },
    { titulo: 'Odisseia', autor: 'Homero', paginas: 544, isbn: '9788500007712', generos: [aventura, poesia] },
    { titulo: 'A Divina Comédia', autor: 'Dante Alighieri', paginas: 480, isbn: '9788585831578', generos: [poesia] },
    { titulo: 'Folhas de Relva', autor: 'Walt Whitman', paginas: 384, isbn: '9788573212419', generos: [poesia] },
    { titulo: 'Os Lusíadas', autor: 'Luís de Camões', paginas: 328, isbn: '9788525417510', generos: [poesia, historia] },
    { titulo: 'O Alquimista', autor: 'Paulo Coelho', paginas: 208, isbn: '9781519006110', generos: [ficcao, aventura] },
  ];

  const livros = await livroRepo.save(
    livrosDados.map((l) =>
      livroRepo.create({
        titulo: l.titulo,
        autor: l.autor,
        paginas: l.paginas,
        isbn: l.isbn,
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
    const qtd = (i % 4) + 2; 
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
    const exemplar = exemplares[exemplarIdx % exemplares.length];
    const usuario = alunos[alunoIdx % alunos.length];
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


  const prazoPadrao = 14;
  for (let i = 0; i < 90; i++) {
    const retiradaHa = 95 - i;
    const atrasado = i % 5 === 0;
    const diasParaDevolver = atrasado
      ? prazoPadrao + 3 + (i % 4)
      : Math.max(1, prazoPadrao - (i % 10));
    const devolucaoEfetivaHa = Math.max(0, retiradaHa - diasParaDevolver);

    await empr(i, i, retiradaHa, prazoPadrao, true, devolucaoEfetivaHa);
  }

  const qtdAtivos = 24;
  for (let i = 0; i < qtdAtivos; i++) {
    const exemplarIdx = exemplares.length - 1 - i;
    const alunoIdx = (i * 3 + 7) % alunos.length;
    const retiradaHa = 2 + (i % 18); // entre 2 e 19 dias atrás

    await empr(exemplarIdx, alunoIdx, retiradaHa, prazoPadrao, false);
  }

  const clubesDados: {
    nome: string;
    professor: Usuario;
    livroIdx: number;
    ativo: boolean;
    inicioHa: number;
    fimEm: number; 
    local: string;
  }[] = [
    { nome: 'Clube de Ficção Científica', professor: professor1, livroIdx: 0, ativo: true, inicioHa: 30, fimEm: 30, local: 'Biblioteca Principal' },
    { nome: 'Clube de Fantasia', professor: professor1, livroIdx: 3, ativo: true, inicioHa: 15, fimEm: 45, local: 'Sala de Leitura B' },
    { nome: 'Clube de Terror', professor: professor1, livroIdx: 15, ativo: true, inicioHa: 5, fimEm: 55, local: 'Auditório' },
    { nome: 'Clube de Filosofia', professor: professor1, livroIdx: 9, ativo: false, inicioHa: 90, fimEm: -10, local: 'Biblioteca Principal' },
    { nome: 'Clube de Biografias', professor: professor1, livroIdx: 25, ativo: false, inicioHa: 120, fimEm: -40, local: 'Sala de Leitura A' },

    { nome: 'Clube de Poesia', professor: professor2, livroIdx: 32, ativo: true, inicioHa: 10, fimEm: 50, local: 'Biblioteca Principal' },
    { nome: 'Clube de Romance', professor: professor2, livroIdx: 6, ativo: true, inicioHa: 20, fimEm: 40, local: 'Sala de Leitura B' },
    { nome: 'Clube de Tecnologia', professor: professor2, livroIdx: 22, ativo: true, inicioHa: 8, fimEm: 52, local: 'Laboratório' },
    { nome: 'Clube de História', professor: professor2, livroIdx: 7, ativo: false, inicioHa: 100, fimEm: -20, local: 'Biblioteca Principal' },
    { nome: 'Clube de Aventura', professor: professor2, livroIdx: 35, ativo: false, inicioHa: 60, fimEm: -5, local: 'Auditório' },
  ];

  const clubes = await clubeLivroRepo.save(
    clubesDados.map((c) =>
      clubeLivroRepo.create({
        nome: c.nome,
        professor: { id: c.professor.id },
        livro: { id: livros[c.livroIdx].id },
        ativo: c.ativo,
        data_inicio: diasAtras(c.inicioHa),
        data_fim: c.ativo ? diasAfrente(c.fimEm) : diasAtras(-c.fimEm),
        local_encontro: c.local,
      }),
    ),
  );

  const membrosPorClube: MembroClube[][] = [];
  let alunoPonteiro = 0;
  for (let i = 0; i < clubes.length; i++) {
    const qtdMembros = (clubesDados[i].livroIdx % 4) + 2;
    const membrosDoClube: MembroClube[] = [];
    for (let j = 0; j < qtdMembros; j++) {
      const aluno = alunos[alunoPonteiro % alunos.length];
      alunoPonteiro++;
      membrosDoClube.push(
        membroClubeRepo.create({
          clube: { id: clubes[i].id },
          usuario: { id: aluno.id },
          status: StatusMembro.CONFIRMADO,
        }),
      );
    }
    membrosPorClube.push(await membroClubeRepo.save(membrosDoClube));
  }

  const pergunta1 = await perguntaRepo.save(
    perguntaRepo.create({ texto: 'Qual é o seu gênero literário favorito?' }),
  );
  const pergunta2 = await perguntaRepo.save(
    perguntaRepo.create({ texto: 'Como avalia a leitura do mês?' }),
  );
  const pergunta3 = await perguntaRepo.save(
    perguntaRepo.create({ texto: 'Você recomendaria este livro para um colega?' }),
  );

  const itensPergunta1 = await itemPerguntaRepo.save([
    itemPerguntaRepo.create({ pergunta: { id: pergunta1.id }, texto: 'Ficção Científica' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta1.id }, texto: 'Fantasia' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta1.id }, texto: 'Romance' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta1.id }, texto: 'Filosofia' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta1.id }, texto: 'Aventura' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta1.id }, texto: 'Terror' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta1.id }, texto: 'Poesia' }),
  ]);

  const itensPergunta2 = await itemPerguntaRepo.save([
    itemPerguntaRepo.create({ pergunta: { id: pergunta2.id }, texto: 'Excelente' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta2.id }, texto: 'Boa' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta2.id }, texto: 'Regular' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta2.id }, texto: 'Ruim' }),
  ]);

  const itensPergunta3 = await itemPerguntaRepo.save([
    itemPerguntaRepo.create({ pergunta: { id: pergunta3.id }, texto: 'Com certeza' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta3.id }, texto: 'Talvez' }),
    itemPerguntaRepo.create({ pergunta: { id: pergunta3.id }, texto: 'Não recomendaria' }),
  ]);

  const todosItens = [itensPergunta1, itensPergunta2, itensPergunta3];

  const alunoDemo = await usuarioRepo.save(
    usuarioRepo.create({
      nome: 'Lucas Demonstração',
      email: 'aluno.demo@email.com',
      senha_hash: senhaHash,
      perfil: TipoPerfil.ALUNO,
      data_nasc: new Date('2011-04-12'),
      instituicao: { id: instituicao.id },
      ativo: true,
    }),
  );

  for (let i = 0; i < 3; i++) {
    const exemplarIdx = exemplares.length - 1 - qtdAtivos - i;
    const exemplar = exemplares[((exemplarIdx % exemplares.length) + exemplares.length) % exemplares.length];
    const retiradaHa = 20 + i * 5;

    await emprestimoRepo.save(
      emprestimoRepo.create({
        exemplar: { id: exemplar.id },
        usuario: { id: alunoDemo.id },
        data_retirada: diasAtras(retiradaHa),
        data_devolucao_esperada: diasAtras(retiradaHa - prazoPadrao),
      }),
    );

    await exemplarRepo.update(exemplar.id, { status: StatusExemplar.EMPRESTADO });
  }


  console.log('Seed concluído com sucesso.');
  await AppDataSource.destroy();
}

void seed();