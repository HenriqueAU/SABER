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
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoPerfil } from '../usuario/usuario.entity';

@ApiTags('Livros')
@ApiBearerAuth()
@Controller('livros')
export class LivroController {
  constructor(private readonly livroService: LivroService) {}

  @Post()
  @Roles(TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({ summary: 'Cadastrar um novo livro' })
  create(@Body() createLivroDto: CreateLivroDto) {
    return this.livroService.create(createLivroDto);
  }

  @Get('buscar-isbn/:isbn')
  @Roles(TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({
    summary: 'Buscar dados de um livro pelo ISBN na Open Library',
  })
  buscarPorIsbn(@Param('isbn') isbn: string) {
    return this.livroService.buscarPorIsbn(isbn);
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
  @Roles(TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({ summary: 'Atualizar os dados de um livro' })
  update(@Param('id') id: string, @Body() updateLivroDto: UpdateLivroDto) {
    return this.livroService.update(id, updateLivroDto);
  }

  @Delete(':id')
  @Roles(TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({ summary: 'Remover um livro' })
  remove(@Param('id') id: string) {
    return this.livroService.remove(id);
  }
}
