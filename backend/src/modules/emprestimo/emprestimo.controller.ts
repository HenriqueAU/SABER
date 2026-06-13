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
import { EmprestimoService } from './emprestimo.service';
import { CreateEmprestimoDto } from './dto/create-emprestimo.dto';
import { UpdateEmprestimoDto } from './dto/update-emprestimo.dto';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Empréstimos')
@ApiBearerAuth()
@Controller('emprestimos')
export class EmprestimoController {
  constructor(private readonly emprestimoService: EmprestimoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo empréstimo' })
  create(@Body() createEmprestimoDto: CreateEmprestimoDto) {
    return this.emprestimoService.create(createEmprestimoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obter todos os empréstimos' })
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    return this.emprestimoService.findAll(instituicao_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter um empréstimo específico pelo ID' })
  findOne(@Param('id') id: string) {
    return this.emprestimoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um empréstimo existente' })
  update(
    @Param('id') id: string,
    @Body() updateEmprestimoDto: UpdateEmprestimoDto,
  ) {
    return this.emprestimoService.update(id, updateEmprestimoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um empréstimo' })
  remove(@Param('id') id: string) {
    return this.emprestimoService.remove(id);
  }
}
