import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';
import { RespostaMembroService } from './resposta-membro.service';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Respostas do membro')
@ApiBearerAuth()
@Controller('resposta-membro')
export class RespostaMembroController {
  constructor(private readonly respostaMembroService: RespostaMembroService) {}

  @ApiOperation({ summary: 'Criação de resposta do membro do clube' })
  @ApiResponse({ status: 201, description: 'Resposta criada com sucesso' })
  @Post()
  create(@Body() createRespostaMembroDto: CreateRespostaMembroDto) {
    return this.respostaMembroService.create(createRespostaMembroDto);
  }

  @ApiOperation({ summary: 'Lista todas as respostas' })
  @ApiResponse({
    status: 200,
    description: 'Lista resposta retornada com sucesso',
  })
  @Get()
  findAll() {
    return this.respostaMembroService.findAll();
  }

  @ApiOperation({ summary: 'Busca uma respota pelo id' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.respostaMembroService.findOne(id);
  }

  @ApiOperation({ summary: 'Remove uma Resposta' })
  @ApiResponse({ status: 200, description: 'Resposta removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.respostaMembroService.remove(id);
  }
}
