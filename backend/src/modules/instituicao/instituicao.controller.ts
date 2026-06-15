import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateInstituicaoDto } from './dto/create-instituicao.dto';
import { InstituicaoService } from './instituicao.service';
import { UpdateInstituicaoDto } from './dto/update-instituicao.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Instituição')
@ApiBearerAuth()
@Controller('instituicao')
export class InstituicaoController {
  constructor(private readonly instituicaoService: InstituicaoService) {}

  @ApiOperation({ summary: 'Cria uma nova instituição' })
  @Post()
  create(@Body() createInstituicaoDto: CreateInstituicaoDto) {
    return this.instituicaoService.create(createInstituicaoDto);
  }

  @ApiOperation({ summary: 'Busca todas as instituições' })
  @Get()
  findAll() {
    return this.instituicaoService.findAll();
  }

  @ApiOperation({ summary: 'Busca instituição por Id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.instituicaoService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza as informações da instituição' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstituicaoDto: UpdateInstituicaoDto,
  ) {
    return this.instituicaoService.update(id, updateInstituicaoDto);
  }

  @ApiOperation({ summary: 'Remove uma instituição' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.instituicaoService.remove(id);
  }
}
