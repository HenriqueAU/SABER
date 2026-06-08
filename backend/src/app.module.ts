import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instituicao } from './modules/instituicao/instituicao.entity';
import { Usuario } from './modules/usuario/usuario.entity';
import { ClubeLivro } from './modules/clube_livro/clube-livro.entity';
import { Emprestimo } from './modules/emprestimo/emprestimo.entity';
import { Exemplar } from './modules/exemplar/exemplar.entity';
import { Genero } from './modules/genero/genero.entity';
import { ItemPergunta } from './modules/item_pergunta/item-pergunta.entity';
import { Livro } from './modules/livro/livro.entity';
import { MembroClube } from './modules/membro_clube/membro-clube.entity';
import { Pergunta } from './modules/pergunta/pergunta.entity';
import { PreferenciaGenero } from './modules/preferencia_genero/preferencia-genero.entity';
import { RespostaMembro } from './modules/resposta_membro/resposta-membro.entity';
import { LivroGenero } from './modules/livro_genero/livro-genero.entity';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { RespostaMembroModule } from './modules/resposta_membro/resposta-membro.module';
import { PreferenciaGeneroModule } from './modules/preferencia_genero/preferencia-genero.module';
import { PerguntaModule } from './modules/pergunta/pergunta.module';
import { MembroClubeModule } from './modules/membro_clube/membro-clube.module';
import { LivroGeneroModule } from './modules/livro_genero/livro-genero.module';
import { LivroModule } from './modules/livro/livro.module';
import { ItemPerguntaModule } from './modules/item_pergunta/item-pergunta.module';
import { InstituicaoModule } from './modules/instituicao/instituicao.module';
import { GeneroModule } from './modules/genero/genero.module';
import { ExemplarModule } from './modules/exemplar/exemplar.module';
import { EmprestimoModule } from './modules/emprestimo/emprestimo.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
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
    }),
    UsuarioModule,
    RespostaMembroModule,
    PreferenciaGeneroModule,
    PerguntaModule,
    MembroClubeModule,
    LivroGeneroModule,
    LivroModule,
    ItemPerguntaModule,
    InstituicaoModule,
    GeneroModule,
    ExemplarModule,
    EmprestimoModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
