import { Controller, Get, Param } from '@nestjs/common';
import { PerguntaService } from './pergunta.service';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Perguntas')
@ApiBearerAuth()
@Controller('pergunta')
export class PerguntaController {
  constructor(private readonly perguntaService: PerguntaService) {}

  @ApiOperation({ summary: 'Lista todas as perguntas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de perguntas retornada com sucesso',
  })
  @Get()
  findAll() {
    return this.perguntaService.findAll();
  }

  @ApiOperation({ summary: 'Busca uma pergunta pelo id' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perguntaService.findOne(id);
  }
}
