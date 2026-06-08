import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { PreferenciaGenero } from './preferencia-genero.entity';
import { PreferenciaGeneroController } from './preferencia-genero.controller';
import { PreferenciaGeneroService } from './preferencia-genero.service';

@Module({
  imports: [TypeOrmModule.forFeature([PreferenciaGenero])],
  controllers: [PreferenciaGeneroController],
  providers: [PreferenciaGeneroService],
})
export class PreferenciaGeneroModule {}
