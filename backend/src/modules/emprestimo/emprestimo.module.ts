import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Emprestimo } from './emprestimo.entity';
import { EmprestimoController } from './emprestimo.controller';
import { EmprestimoService } from './emprestimo.service';
import { ExemplarModule } from '../exemplar/exemplar.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Emprestimo]),
    ExemplarModule,
    UsuarioModule,
  ],
  controllers: [EmprestimoController],
  providers: [EmprestimoService],
  exports: [EmprestimoService],
})
export class EmprestimoModule {}
