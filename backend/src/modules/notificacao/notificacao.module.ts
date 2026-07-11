import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoController } from './notificacao.controller';
import { Notificacao } from './notificacao.entity';
import { EmprestimoModule } from '../emprestimo/emprestimo.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { MembroClubeModule } from '../membro_clube/membro-clube.module';
import { ClubeModule } from '../clube_livro/clube-livro.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notificacao]),
    EmprestimoModule,
    UsuarioModule,
    MembroClubeModule,
    ClubeModule,
  ],
  controllers: [NotificacaoController],
  providers: [NotificacaoService],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}
