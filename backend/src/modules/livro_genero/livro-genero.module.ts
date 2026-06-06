import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LivroGenero } from './livro-genero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LivroGenero])],
})
export class LivroGeneroModule {}
