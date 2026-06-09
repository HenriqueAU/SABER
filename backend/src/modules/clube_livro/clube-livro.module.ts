import { Module } from '@nestjs/common';
import { ClubeService } from './clube-livro.service';
import { ClubeController } from './clube-livro.controller';
import { ClubeLivro } from './clube-livro.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ClubeLivro])],
  controllers: [ClubeController],
  providers: [ClubeService],
})
export class ClubeModule {}
