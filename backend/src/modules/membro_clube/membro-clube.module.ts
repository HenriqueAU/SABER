import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MembroClube } from './membro-clube.entity';
import { MembroClubeController } from './membro-clube.controller';
import { MembroClubeService } from './membro-clube.service';
import { ClubeModule } from '../clube_livro/clube-livro.module';
import { UsuarioModule } from '../usuario/usuario.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MembroClube]),
    ClubeModule,
    UsuarioModule,
  ],
  controllers: [MembroClubeController],
  providers: [MembroClubeService],
})
export class MembroClubeModule {}
