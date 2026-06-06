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
import { PreferenciaGenero } from '../modules/preferencia-genero/preferencia-genero.entity';
import { RespostaMembro } from '../modules/resposta_membro/resposta-membro.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: '',
  password: '',
  database: '',
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
  ],
});
