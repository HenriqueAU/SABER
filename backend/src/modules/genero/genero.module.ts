import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Genero } from './genero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genero])],
})
export class GeneroModule {}
