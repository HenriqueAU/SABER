import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GeneroService } from './genero.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/update-genero.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Gêneros')
@ApiBearerAuth()
@Controller('generos')
export class GeneroController {
  constructor(private readonly generoService: GeneroService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo gênero literário' })
  create(@Body() createGeneroDto: CreateGeneroDto) {
    return this.generoService.create(createGeneroDto);
  }

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

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um gênero' })
  update(@Param('id') id: string, @Body() updateGeneroDto: UpdateGeneroDto) {
    return this.generoService.update(id, updateGeneroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um gênero' })
  remove(@Param('id') id: string) {
    return this.generoService.remove(id);
  }
}
