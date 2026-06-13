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
import { ExemplarService } from './exemplar.service';
import { CreateExemplarDto } from './dto/create-exemplar.dto';
import { UpdateExemplarDto } from './dto/update-exemplar.dto';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Exemplares')
@Controller('exemplares')
export class ExemplarController {
  constructor(private readonly exemplarService: ExemplarService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo exemplar' })
  create(
    @Body() createExemplarDto: CreateExemplarDto,
    @Req() request: RequestComUser,
  ) {
    const instituicao_id = request.user.instituicao;
    return this.exemplarService.create(createExemplarDto, instituicao_id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os exemplares da instituição' })
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    return this.exemplarService.findAll(instituicao_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um exemplar pelo ID' })
  findOne(@Param('id') id: string) {
    return this.exemplarService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados do exemplar' })
  update(
    @Param('id') id: string,
    @Body() updateExemplarDto: UpdateExemplarDto,
  ) {
    return this.exemplarService.update(id, updateExemplarDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um exemplar' })
  remove(@Param('id') id: string) {
    return this.exemplarService.remove(id);
  }
}
