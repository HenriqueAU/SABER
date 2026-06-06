import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Instituicao } from '../modules/instituicao/instituicao.entity';
import { Usuario } from '../modules/usuario/usuario.entity';
import { ClubeLivro } from '../modules/clube_livro/clube-livro.entity';
import { Emprestimo } from '../modules/emprestimo/emprestimo.entity';
import { Exemplar } from '../modules/exemplar/exemplar.entity';
import { Genero } from '../modules/genero/genero.entity';
import { ItemPergunta } from '../modules/item_pergunta/item-pergunta.entity';
import { Livro } from '../modules/livro/livro.entity';
import { MembroClube } from '../modules/membro_clube/membro-clube.entity';
import { Pergunta } from '../modules/pergunta/pergunta.entity';
import { PreferenciaGenero } from '../modules/preferencia_genero/preferencia-genero.entity';
import { RespostaMembro } from '../modules/resposta_membro/resposta-membro.entity';
import { LivroGenero } from '../modules/livro_genero/livro-genero.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [
    Instituicao,
    Usuario,
    ClubeLivro,
    Emprestimo,
    Exemplar,
    Genero,
    ItemPergunta,
    Livro,
    MembroClube,
    Pergunta,
    PreferenciaGenero,
    RespostaMembro,
    LivroGenero,
  ],
  synchronize: false,
  migrations: ['src/database/migrations/*.ts'],
});
