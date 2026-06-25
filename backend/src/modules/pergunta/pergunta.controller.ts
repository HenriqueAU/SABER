import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreatePerguntaDto } from './dto/create-pergunta.dto';
import { PerguntaService } from './pergunta.service';
import { UpdatePerguntaDto } from './dto/update-pergunta.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import {Roles} from '../../common/decorators/roles.decorator'

@ApiTags('perguntas')
@ApiBearerAuth()
@Controller('pergunta')
export class PerguntaController {
  constructor(private readonly perguntaService: PerguntaService) {}

  @ApiOperation({ summary: 'Criação de nova pergunta' })
  @ApiResponse({ status: 201, description: 'Pergunta criada com sucesso' })
  @Roles()
  @Post()
  create(@Body() createPerguntaDto: CreatePerguntaDto) {
    return this.perguntaService.create(createPerguntaDto);
  }

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

  @ApiOperation({ summary: 'Atualiza uma pergunta existente' })
  @ApiResponse({
    status: 200,
    description: 'Atualização realizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada' })
  @Roles()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() UpdatePerguntaDto: UpdatePerguntaDto,
  ) {
    return this.perguntaService.update(id, UpdatePerguntaDto);
  }

  @ApiOperation({ summary: 'Remove uma pergunta' })
  @ApiResponse({ status: 200, description: 'Pergunta removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Pergunta não encontrada' })
  @Roles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perguntaService.remove(id);
  }
}
