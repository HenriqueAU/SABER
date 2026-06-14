import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ItemPergunta } from './item-pergunta.entity';
import { ItemPerguntaService } from './item-pergunta.service';
import { ItemPerguntaController } from './item-pergunta.controller';
import { Pergunta } from '../pergunta/pergunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemPergunta, Pergunta])],
  controllers: [ItemPerguntaController],
  providers: [ItemPerguntaService],
  exports: [ItemPerguntaService],
})
export class ItemPerguntaModule {}
