import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { LivroGeneroService } from './livro-genero.service';
import { CreateLivroGeneroDto } from './dto/create-livro-genero.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Relação Livro <-> Gênero')
@Controller('livro-generos')
export class LivroGeneroController {
  constructor(private readonly livroGeneroService: LivroGeneroService) {}

  @Post()
  @ApiOperation({ summary: 'Vincular um gênero a um livro' })
  create(@Body() createLivroGeneroDto: CreateLivroGeneroDto) {
    return this.livroGeneroService.create(createLivroGeneroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as relações Livro-Gênero' })
  findAll() {
    return this.livroGeneroService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma relação pelo ID' })
  findOne(@Param('id') id: string) {
    return this.livroGeneroService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desvincular um gênero de um livro' })
  remove(@Param('id') id: string) {
    return this.livroGeneroService.remove(id);
  }
}
