import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PreferenciaGeneroService } from './preferencia-genero.service';
import { CreatePreferenciaGeneroDto } from './dto/create-preferencia-genero.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Preferências de Gênero')
@ApiBearerAuth()
@Controller('preferencias-genero')
export class PreferenciaGeneroController {
  constructor(
    private readonly preferenciaGeneroService: PreferenciaGeneroService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova preferência de gênero' })
  create(@Body() createPreferenciaGeneroDto: CreatePreferenciaGeneroDto) {
    return this.preferenciaGeneroService.create(createPreferenciaGeneroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obter todas as preferências de gênero' })
  findAll() {
    return this.preferenciaGeneroService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obter uma preferência de gênero específica pelo ID',
  })
  findOne(@Param('id') id: string) {
    return this.preferenciaGeneroService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma preferência de gênero' })
  remove(@Param('id') id: string) {
    return this.preferenciaGeneroService.remove(id);
  }
}
