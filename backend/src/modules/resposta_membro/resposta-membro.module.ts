import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RespostaMembro } from './resposta-membro.entity';
import { RespostaMembroService } from './resposta-membro.service';
import { RespostaMembroController } from './resposta-membro.controller';
import { MembroClube } from '../membro_clube/membro-clube.entity';
import { ItemPergunta } from '../item_pergunta/item-pergunta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RespostaMembro, MembroClube, ItemPergunta]),
  ],
  controllers: [RespostaMembroController],
  providers: [RespostaMembroService],
})
export class RespostaMembroModule {}
