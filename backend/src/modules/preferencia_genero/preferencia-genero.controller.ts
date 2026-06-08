import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PreferenciaGeneroService } from './preferencia-genero.service';
import { CreatePreferenciaGeneroDto } from './dto/create-preferencia-genero.dto';

@Controller('preferencias-genero')
export class PreferenciaGeneroController {
  constructor(
    private readonly preferenciaGeneroService: PreferenciaGeneroService,
  ) {}

  @Post()
  create(@Body() createPreferenciaGeneroDto: CreatePreferenciaGeneroDto) {
    return this.preferenciaGeneroService.create(createPreferenciaGeneroDto);
  }

  @Get()
  findAll() {
    return this.preferenciaGeneroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preferenciaGeneroService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preferenciaGeneroService.remove(id);
  }
}
