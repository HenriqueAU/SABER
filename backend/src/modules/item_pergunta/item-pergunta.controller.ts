import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateItemPerguntaDto } from './dto/create-item-pergunta.dto';
import { ItemPerguntaService } from './item-pergunta.service';
import { UpdateItemPerguntaDto } from './dto/update-item-pergunta.dto';

@Controller('item-pergunta')
export class ItemPerguntaController {
  constructor(private readonly itemPerguntaService: ItemPerguntaService) {}

  @Post()
  create(@Body() createItemPerguntaDto: CreateItemPerguntaDto) {
    return this.itemPerguntaService.create(createItemPerguntaDto);
  }

  @Get()
  findAll() {
    return this.itemPerguntaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemPerguntaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemPerguntaDto: UpdateItemPerguntaDto) {
    return this.itemPerguntaService.update(id, updateItemPerguntaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemPerguntaService.remove(id);
  }
}
