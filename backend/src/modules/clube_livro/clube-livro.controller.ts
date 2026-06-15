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
import { ClubeService } from './clube-livro.service';
import { UpdateClubeLivroDto } from './dto/update-clube-livro.dto';
import { CreateClubeLivroDto } from './dto/create-clube-livro.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';

@ApiTags('Clubes')
@ApiBearerAuth()
@Controller('clubes')
export class ClubeController {
  constructor(private readonly clubeService: ClubeService) {}

  @ApiOperation({ summary: 'Criação do Clube do Livro' })
  @ApiResponse({
    status: 201,
    description: 'Clube do livro criado com sucesso',
  })
  @Post()
  create(@Body() createClubeDto: CreateClubeLivroDto) {
    return this.clubeService.create(createClubeDto);
  }

  @ApiOperation({ summary: 'Lista todos os clube do livro' })
  @ApiResponse({
    status: 200,
    description: 'Lista de clubes retornada com sucesso',
  })
  @Get()
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    return this.clubeService.findAll(instituicao_id);
  }

  @ApiOperation({ summary: 'Busca um clube do livro pelo id' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Clube do livro não encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clubeService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um clube do livro existente' })
  @ApiResponse({
    status: 200,
    description: 'Atualização realizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Clube do livro não encontrado' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() UpdateClubeLivroDto: UpdateClubeLivroDto,
  ) {
    return this.clubeService.update(id, UpdateClubeLivroDto);
  }

  @ApiOperation({ summary: 'Remove um clube do livro' })
  @ApiResponse({
    status: 200,
    description: 'Clube do livro removida com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Clube do livro não encontrado' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clubeService.remove(id);
  }
}
