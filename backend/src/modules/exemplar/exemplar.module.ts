import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Exemplar } from './exemplar.entity';
import { ExemplarService } from './exemplar.service';
import { ExemplarController } from './exemplar.controller';
import { LivroModule } from '../livro/livro.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exemplar]), LivroModule],
  controllers: [ExemplarController],
  providers: [ExemplarService],
  exports: [ExemplarService],
})
export class ExemplarModule {}
