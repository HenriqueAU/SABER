import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Livro } from './livro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Livro])],
})
export class LivroModule {}
