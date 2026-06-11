import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RespostaMembro } from './resposta-membro.entity';
import { RespostaMembroService } from './resposta-membro.service';
import { RespostaMembroController } from './resposta-membro.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RespostaMembro])],
  controllers: [RespostaMembroController],
  providers: [RespostaMembroService],
})
export class RespostaMembroModule {}
