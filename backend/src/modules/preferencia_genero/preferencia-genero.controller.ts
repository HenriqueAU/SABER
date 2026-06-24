import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PreferenciaGeneroService } from './preferencia-genero.service';
import { CreatePreferenciaGeneroDto } from './dto/create-preferencia-genero.dto';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoPerfil } from '../usuario/usuario.entity';

@ApiTags('Preferencias Genero')
@ApiBearerAuth()
@Controller('preferencias-genero')
export class PreferenciaGeneroController {
  constructor(
    private readonly preferenciaGeneroService: PreferenciaGeneroService,
  ) {}

  @Post()
  @Roles(TipoPerfil.ALUNO)
  @ApiOperation({ summary: 'Criar uma nova preferência de gênero' })
  create(@Body() createPreferenciaGeneroDto: CreatePreferenciaGeneroDto) {
    return this.preferenciaGeneroService.create(createPreferenciaGeneroDto);
  }

  @Get()
  @Roles(TipoPerfil.ALUNO)
  @ApiOperation({ summary: 'Obter todas as preferências de gênero' })
  findAll(@Req() request: RequestComUser) {
    const usuarioToken = request.user.id;
    return this.preferenciaGeneroService.findAll(usuarioToken);
  }

  @Get(':id')
  @Roles(TipoPerfil.ALUNO)
  @ApiOperation({
    summary: 'Obter uma preferência de gênero específica pelo ID',
  })
  findOne(@Param('id') id: string, @Req() request: RequestComUser) {
    const usuarioToken = request.user.id;
    return this.preferenciaGeneroService.findOne(id, usuarioToken);
  }

  @Delete(':id')
  @Roles(TipoPerfil.ALUNO)
  @ApiOperation({ summary: 'Excluir uma preferência de gênero' })
  remove(@Param('id') id: string, @Req() request: RequestComUser) {
    const usuarioToken = request.user.id;
    return this.preferenciaGeneroService.remove(id, usuarioToken);
  }
}
