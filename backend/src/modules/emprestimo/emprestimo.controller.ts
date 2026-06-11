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

@Controller('emprestimos')
export class EmprestimoController {
  constructor(private readonly emprestimoService: EmprestimoService) {}

  @Post()
  create(@Body() createEmprestimoDto: CreateEmprestimoDto) {
    return this.emprestimoService.create(createEmprestimoDto);
  }

  @Get()
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    return this.emprestimoService.findAll(instituicao_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emprestimoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEmprestimoDto: UpdateEmprestimoDto,
  ) {
    return this.emprestimoService.update(id, updateEmprestimoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emprestimoService.remove(id);
  }
}
