import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ItemPergunta } from './item-pergunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemPergunta])],
})
export class ItemPerguntaModule {}
