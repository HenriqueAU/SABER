import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Livro } from './livro.entity';
import { LivroService } from './livro.service';
import { LivroController } from './livro.controller';
import { HttpModule } from '@nestjs/axios/dist/http.module';

@Module({
  imports: [TypeOrmModule.forFeature([Livro]), HttpModule],
  controllers: [LivroController],
  providers: [LivroService],
  exports: [LivroService],
})
export class LivroModule {}
