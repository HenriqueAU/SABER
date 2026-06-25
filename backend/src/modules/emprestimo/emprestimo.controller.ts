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
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoPerfil } from '../usuario/usuario.entity';

@ApiTags('Emprestimos')
@ApiBearerAuth()
@Controller('emprestimos')
export class EmprestimoController {
  constructor(private readonly emprestimoService: EmprestimoService) {}

  @Post()
  @Roles(TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({ summary: 'Criar um novo empréstimo' })
  create(@Body() createEmprestimoDto: CreateEmprestimoDto) {
    return this.emprestimoService.create(createEmprestimoDto);
  }

  @Get()
  @Roles(TipoPerfil.BIBLIOTECARIO, TipoPerfil.ALUNO)
  @ApiOperation({ summary: 'Obter todos os empréstimos' })
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    const perfilLogado = request.user.perfil;
    const usuarioToken = request.user.id;
    return this.emprestimoService.findAll(
      instituicao_id,
      perfilLogado,
      usuarioToken,
    );
  }

  @Get(':id')
  @Roles(TipoPerfil.BIBLIOTECARIO, TipoPerfil.ALUNO)
  @ApiOperation({ summary: 'Obter um empréstimo específico pelo ID' })
  findOne(@Param('id') id: string, @Req() request: RequestComUser) {
    return this.emprestimoService.findOne(
      id,
      request.user.perfil,
      request.user.id,
    );
  }

  @Patch(':id')
  @Roles(TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({ summary: 'Atualizar um empréstimo existente' })
  update(
    @Param('id') id: string,
    @Body() updateEmprestimoDto: UpdateEmprestimoDto,
  ) {
    return this.emprestimoService.update(id, updateEmprestimoDto);
  }

  @Delete(':id')
  @Roles(TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({ summary: 'Excluir um empréstimo' })
  remove(@Param('id') id: string) {
    return this.emprestimoService.remove(id);
  }
}
