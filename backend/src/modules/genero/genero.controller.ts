import { Controller, Get, Param } from '@nestjs/common';
import { GeneroService } from './genero.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Generos')
@ApiBearerAuth()
@Controller('generos')
export class GeneroController {
  constructor(private readonly generoService: GeneroService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os gêneros' })
  findAll() {
    return this.generoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um gênero pelo ID' })
  findOne(@Param('id') id: string) {
    return this.generoService.findOne(id);
  }
}
