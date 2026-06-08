import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Emprestimo } from './emprestimo.entity';
import { EmprestimoController } from './emprestimo.controller';
import { EmprestimoService } from './emprestimo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Emprestimo])],
  controllers: [EmprestimoController],
  providers: [EmprestimoService],
})
export class EmprestimoModule {}
