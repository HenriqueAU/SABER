import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { LivroGeneroService } from './livro-genero.service';
import { CreateLivroGeneroDto } from './dto/create-livro-genero.dto';

@Controller('livro-generos')
export class LivroGeneroController {
  constructor(private readonly livroGeneroService: LivroGeneroService) {}

  @Post()
  create(@Body() createLivroGeneroDto: CreateLivroGeneroDto) {
    return this.livroGeneroService.create(createLivroGeneroDto);
  }

  @Get()
  findAll() {
    return this.livroGeneroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livroGeneroService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.livroGeneroService.remove(id);
  }
}
