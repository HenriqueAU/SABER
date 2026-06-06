import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PreferenciaGenero } from './preferencia-genero.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PreferenciaGenero])],
})
export class PreferenciaGeneroModule {}
