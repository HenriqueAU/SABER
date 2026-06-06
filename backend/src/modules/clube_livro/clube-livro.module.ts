import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubeLivro } from './clube-livro.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([ClubeLivro])],
})
export class ClubeLivroModule {}
