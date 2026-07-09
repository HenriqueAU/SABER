import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Emprestimo } from './emprestimo.entity';
import { EmprestimoController } from './emprestimo.controller';
import { EmprestimoService } from './emprestimo.service';
import { ExemplarModule } from '../exemplar/exemplar.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { NotificacaoModule } from '../notificacao/notificacao.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Emprestimo]),
    ExemplarModule,
    UsuarioModule,
    NotificacaoModule
  ],
  controllers: [EmprestimoController],
  providers: [EmprestimoService],
})
export class EmprestimoModule {}
