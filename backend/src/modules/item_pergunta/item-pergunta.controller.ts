import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateItemPerguntaDto } from './dto/create-item-pergunta.dto';
import { ItemPerguntaService } from './item-pergunta.service';
import { UpdateItemPerguntaDto } from './dto/update-item-pergunta.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from'../../common/decorators/roles.decorator'

@ApiTags('item-da-pergunta')
@ApiBearerAuth()
@Controller('item-pergunta')
export class ItemPerguntaController {
  constructor(private readonly itemPerguntaService: ItemPerguntaService) {}

  @ApiOperation({ summary: 'Criação do item da pergunta' })
  @ApiResponse({
    status: 201,
    description: 'Item da Pergunta criado com sucesso',
  })
  @Roles()
  @Post()
  create(@Body() createItemPerguntaDto: CreateItemPerguntaDto) {
    return this.itemPerguntaService.create(createItemPerguntaDto);
  }

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

  @ApiOperation({ summary: 'Atualiza um item existente' })
  @ApiResponse({
    status: 200,
    description: 'Atualização realizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  @Roles()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemPerguntaDto: UpdateItemPerguntaDto,
  ) {
    return this.itemPerguntaService.update(id, updateItemPerguntaDto);
  }

  @ApiOperation({ summary: 'Remove um item' })
  @ApiResponse({ status: 200, description: 'item removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Item não encontrado' })
  @Roles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemPerguntaService.remove(id);
  }
}
