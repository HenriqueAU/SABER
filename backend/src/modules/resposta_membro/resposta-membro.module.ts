import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { RespostaMembro } from './resposta-membro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RespostaMembro])],
})
export class RespostaMembroModule {}
