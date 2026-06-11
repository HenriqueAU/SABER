import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';
import { RespostaMembroService } from './resposta-membro.service';

@Controller('resposta-membro')
export class RespostaMembroController {
  constructor(private readonly respostaMembroService: RespostaMembroService) {}

  @Post()
  create(@Body() createRespostaMembroDto: CreateRespostaMembroDto) {
    return this.respostaMembroService.create(createRespostaMembroDto);
  }

  @Get()
  findAll() {
    return this.respostaMembroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.respostaMembroService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.respostaMembroService.remove(id);
  }
}
