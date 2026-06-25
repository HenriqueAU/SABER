import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoPerfil } from './usuario.entity';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles(TipoPerfil.GESTOR)
  @ApiOperation({ summary: 'Criar um novo usuário' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @Roles(TipoPerfil.GESTOR)
  @ApiOperation({ summary: 'Buscar todos os usuários' })
  findAll(@Req() request: RequestComUser) {
    const instituicao_id = request.user.instituicao;
    return this.usuarioService.findAll(instituicao_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  findOne(@Param('id') id: string, @Req() request: RequestComUser) {
    const usuarioLogadoId = request.user.id;
    const perfilLogado = request.user.perfil;
    return this.usuarioService.findOne(id, usuarioLogadoId, perfilLogado);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar informações do usuário' })
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() request: RequestComUser,
  ) {
    const usuarioLogadoId = request.user.id;
    const perfilLogado = request.user.perfil;
    return this.usuarioService.update(
      id,
      usuarioLogadoId,
      perfilLogado,
      updateUsuarioDto,
    );
  }

  @Delete(':id')
  @Roles(TipoPerfil.GESTOR)
  @ApiOperation({ summary: 'Deletar usuário' })
  remove(@Param('id') id: string, @Req() request: RequestComUser) {
    const usuarioLogadoId = request.user.id;
    const perfilLogado = request.user.perfil;
    return this.usuarioService.remove(id, usuarioLogadoId, perfilLogado);
  }
}
