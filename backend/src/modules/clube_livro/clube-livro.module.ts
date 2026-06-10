import { Module } from '@nestjs/common';
import { ClubeService } from './clube-livro.service';
import { ClubeController } from './clube-livro.controller';
import { ClubeLivro } from './clube-livro.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from '../usuario/usuario.module';
import { LivroModule } from '../livro/livro.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClubeLivro]), UsuarioModule, LivroModule],
  controllers: [ClubeController],
  providers: [ClubeService],
})
export class ClubeModule {}
