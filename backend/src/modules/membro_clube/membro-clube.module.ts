import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MembroClube } from './membro-clube.entity';
import { MembroClubeController } from './membro-clube.controller';
import { MembroClubeService } from './membro-clube.service';

@Module({
  imports: [TypeOrmModule.forFeature([MembroClube])],
  controllers: [MembroClubeController],
  providers: [MembroClubeService],
  exports: [MembroClubeService],
})
export class MembroClubeModule {}
