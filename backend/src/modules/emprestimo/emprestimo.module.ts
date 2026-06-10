import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Emprestimo } from './emprestimo.entity';
import { EmprestimoController } from './emprestimo.controller';
import { EmprestimoService } from './emprestimo.service';
import { ExemplarService } from '../exemplar/exemplar.service';

@Module({
  imports: [TypeOrmModule.forFeature([Emprestimo]), ExemplarService],
  controllers: [EmprestimoController],
  providers: [EmprestimoService],
})
export class EmprestimoModule {}
