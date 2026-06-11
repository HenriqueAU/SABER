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

@Controller('pergunta')
export class PerguntaController {
  constructor(private readonly perguntaService: PerguntaService) {}

  @Post()
  create(@Body() createPerguntaDto: CreatePerguntaDto) {
    return this.perguntaService.create(createPerguntaDto);
  }

  @Get()
  findAll() {
    return this.perguntaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perguntaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() UpdatePerguntaDto: UpdatePerguntaDto,
  ) {
    return this.perguntaService.update(id, UpdatePerguntaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.perguntaService.remove(id);
  }
}
