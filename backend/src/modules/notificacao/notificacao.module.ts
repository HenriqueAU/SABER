import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacaoService } from './notificacao.service';
import { NotificacaoController } from './notificacao.controller';
import { Notificacao } from './notificacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacao])],
  controllers: [NotificacaoController],
  providers: [NotificacaoService],
  exports: [NotificacaoService],
})
export class NotificacaoModule {}