import { Controller, Get, Param } from '@nestjs/common';
import { ItemPerguntaService } from './item-pergunta.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('ItemPergunta')
@ApiBearerAuth()
@Controller('item-pergunta')
export class ItemPerguntaController {
  constructor(private readonly itemPerguntaService: ItemPerguntaService) {}

  @ApiOperation({ summary: 'Lista todos os itens' })
  @ApiResponse({
    status: 200,
    description: 'Lista de itens retornada com sucesso',
  })
  @Get()
  findAll() {
    return this.itemPerguntaService.findAll();
  }

  @ApiOperation({ summary: 'Busca um item pelo id' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemPerguntaService.findOne(id);
  }
}
