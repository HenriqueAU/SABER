import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MembroClube } from './membro-clube.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MembroClube])],
})
export class MembroClubeModule {}
