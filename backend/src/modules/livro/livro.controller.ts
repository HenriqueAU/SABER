import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { LivroService } from './livro.service';
import { CreateLivroDto } from './dto/create-livro.dto';
import { UpdateLivroDto } from './dto/update-livro.dto';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';

@Controller('livros')
export class LivroController {
  constructor(private readonly livroService: LivroService) {}

  @Post()
  create(@Body() createLivroDto: CreateLivroDto) {
    return this.livroService.create(createLivroDto);
  }

  @Get()
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    return this.livroService.findAll(instituicao_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLivroDto: UpdateLivroDto) {
    return this.livroService.update(id, updateLivroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.livroService.remove(id);
  }
}
