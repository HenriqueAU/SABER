import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { CreateInstituicaoDto } from './dto/create-instituicao.dto';
import { InstituicaoService } from './instituicao.service';
import { UpdateInstituicaoDto } from './dto/update-instituicao.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoPerfil } from '../usuario/usuario.entity';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';

@ApiTags('Instituicao')
@ApiBearerAuth()
@Controller('instituicao')
export class InstituicaoController {
  constructor(private readonly instituicaoService: InstituicaoService) {}

  @ApiOperation({ summary: 'Cria uma nova instituição' })
  @Post()
  @Roles(TipoPerfil.GESTOR)
  create(@Body() createInstituicaoDto: CreateInstituicaoDto) {
    return this.instituicaoService.create(createInstituicaoDto);
  }

  @ApiOperation({ summary: 'Busca todas as instituições' })
  @Get()
  @Roles(TipoPerfil.GESTOR)
  findAll(@Req() request: RequestComUser) {
    const instituicaoUsuarioId = request.user.instituicao;
    return this.instituicaoService.findAll(instituicaoUsuarioId);
  }

  @ApiOperation({ summary: 'Busca instituição por Id' })
  @Get(':id')
  @Roles(TipoPerfil.GESTOR)
  findOne(@Param('id') id: string, @Req() request: RequestComUser) {
    const instituicaoUsuarioId = request.user.instituicao;
    return this.instituicaoService.findOne(id, instituicaoUsuarioId);
  }

  @ApiOperation({ summary: 'Atualiza as informações da instituição' })
  @Patch(':id')
  @Roles(TipoPerfil.GESTOR)
  update(
    @Param('id') id: string,
    @Body() updateInstituicaoDto: UpdateInstituicaoDto,
    @Req() request: RequestComUser,
  ) {
    const instituicaoUsuarioId = request.user.instituicao;
    return this.instituicaoService.update(
      id,
      instituicaoUsuarioId,
      updateInstituicaoDto,
    );
  }
}
