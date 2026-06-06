import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Instituicao } from './instituicao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Instituicao])],
})
export class InstituicaoModule {}
