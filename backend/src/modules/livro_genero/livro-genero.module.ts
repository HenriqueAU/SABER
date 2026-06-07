import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { LivroGenero } from './livro-genero.entity';
import { LivroGeneroService } from './livro-genero.service';
import { LivroGeneroController } from './livro-genero.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LivroGenero])],
  controllers: [LivroGeneroController],
  providers: [LivroGeneroService],
  exports: [LivroGeneroService],
})
export class LivroGeneroModule {}
