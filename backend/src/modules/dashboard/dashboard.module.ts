import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Emprestimo } from '../emprestimo/emprestimo.entity';
import { Livro } from '../livro/livro.entity';
import { Genero } from '../genero/genero.entity';
import { Exemplar } from '../exemplar/exemplar.entity';
import { LivroGenero } from '../livro_genero/livro-genero.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Emprestimo, Livro, Genero, Exemplar, LivroGenero]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}