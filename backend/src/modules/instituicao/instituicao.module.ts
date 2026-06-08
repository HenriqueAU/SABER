import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Instituicao } from './instituicao.entity';
import { InstituicaoController } from './instituicao.controller';
import { InstituicaoService } from './instituicao.service';

@Module({
  imports: [TypeOrmModule.forFeature([Instituicao])],
  controllers: [InstituicaoController],
  providers: [InstituicaoService],
  exports: [InstituicaoService],
})
export class InstituicaoModule {}
