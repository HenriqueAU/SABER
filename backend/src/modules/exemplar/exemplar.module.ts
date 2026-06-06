import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Exemplar } from './exemplar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exemplar])],
})
export class ExemplarModule {}
