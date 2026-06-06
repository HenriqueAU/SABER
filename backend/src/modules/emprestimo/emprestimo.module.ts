import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Emprestimo } from './emprestimo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Emprestimo])],
})
export class EmprestimoModule {}
