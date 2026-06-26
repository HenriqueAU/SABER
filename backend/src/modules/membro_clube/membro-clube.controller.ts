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
import { MembroClubeService } from './membro-clube.service';
import { CreateMembroClubeDto } from './dto/create-membro-clube.dto';
import { UpdateMembroClubeDto } from './dto/update-membro-clube.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoPerfil } from '../usuario/usuario.entity';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';

@ApiTags('MembroClube')
@ApiBearerAuth()
@Controller('membro-clube')
export class MembroClubeController {
  constructor(private readonly membroClubeService: MembroClubeService) {}

  @ApiOperation({ summary: 'Criação do membro do clube' })
  @ApiResponse({ status: 201, description: 'Membro criado com sucesso' })
  @Roles(TipoPerfil.ALUNO)
  @Post()
  create(@Body() createMembroClubeDto: CreateMembroClubeDto) {
    return this.membroClubeService.create(createMembroClubeDto);
  }

  @ApiOperation({ summary: 'Lista todos os membros do clube' })
  @ApiResponse({
    status: 200,
    description: 'Lista de membros retornada com sucesso',
  })
  @Roles(TipoPerfil.PROFESSOR)
  @Get()
  findAll() {
    return this.membroClubeService.findAll;
  }

  @ApiOperation({ summary: 'Busca a inscrição do usuário logado num clube específico' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @Roles(TipoPerfil.ALUNO, TipoPerfil.PROFESSOR)
  @Get('me/:clube_id')
  findMinhaInscricao(@Param('clube_id') clube_id: string, @Req() request: RequestComUser) {
    const usuarioId = request.user.id;
    return this.membroClubeService.findMinhaInscricao(usuarioId, clube_id);
  }

  @ApiOperation({ summary: 'Busca um membro pelo id' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  @Roles(TipoPerfil.PROFESSOR, TipoPerfil.ALUNO)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membroClubeService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualiza um membro existente' })
  @ApiResponse({
    status: 200,
    description: 'Atualização realizada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  @Roles(TipoPerfil.PROFESSOR)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMembroClubeDto: UpdateMembroClubeDto,
  ) {
    return this.membroClubeService.update(id, updateMembroClubeDto);
  }

  @ApiOperation({ summary: 'Remove um membro' })
  @ApiResponse({ status: 200, description: 'Membro removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  @Roles(TipoPerfil.ALUNO)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membroClubeService.remove(id);
  }
}
