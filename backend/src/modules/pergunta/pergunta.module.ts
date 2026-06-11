import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Pergunta } from './pergunta.entity';
import { PerguntaService } from './pergunta.service';
import { PerguntaController } from './pergunta.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pergunta])],
  controllers: [PerguntaController],
  providers: [PerguntaService],
  exports: [PerguntaService],
})
export class PerguntaModule {}
