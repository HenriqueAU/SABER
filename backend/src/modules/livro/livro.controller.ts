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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Livros')
@ApiBearerAuth()
@Controller('livros')
export class LivroController {
  constructor(private readonly livroService: LivroService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo livro' })
  create(@Body() createLivroDto: CreateLivroDto) {
    return this.livroService.create(createLivroDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os livros da instituição' })
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    return this.livroService.findAll(instituicao_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um livro pelo ID' })
  findOne(@Param('id') id: string) {
    return this.livroService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de um livro' })
  update(@Param('id') id: string, @Body() updateLivroDto: UpdateLivroDto) {
    return this.livroService.update(id, updateLivroDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um livro' })
  remove(@Param('id') id: string) {
    return this.livroService.remove(id);
  }
}
