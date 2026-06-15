import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RespostaMembro } from './resposta-membro.entity';
import { RespostaMembroService } from './resposta-membro.service';
import { RespostaMembroController } from './resposta-membro.controller';
import { MembroClubeModule } from '../membro_clube/membro-clube.module';
import { ItemPerguntaModule } from '../item_pergunta/item-pergunta.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RespostaMembro]),
    MembroClubeModule,
    ItemPerguntaModule,
  ],
  controllers: [RespostaMembroController],
  providers: [RespostaMembroService],
})
export class RespostaMembroModule {}
