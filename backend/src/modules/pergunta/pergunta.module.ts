import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { Pergunta } from './pergunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pergunta])],
})
export class PerguntaModule {}
