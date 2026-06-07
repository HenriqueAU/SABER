import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Exemplar } from './exemplar.entity';
import { ExemplarService } from './exemplar.service';
import { ExemplarController } from './exemplar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exemplar])],
  controllers: [ExemplarController],
  providers: [ExemplarService],
  exports: [ExemplarService],
})
export class ExemplarModule {}
