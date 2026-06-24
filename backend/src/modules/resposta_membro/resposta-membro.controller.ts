import {Controller, Get, Post,Body,Param,Delete,Req,}from '@nestjs/common';
import { CreateRespostaMembroDto } from './dto/create-resposta-membro.dto';
import { RespostaMembroService } from './resposta-membro.service';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoPerfil } from '../usuario/usuario.entity';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';

@ApiTags('respostas-do-membro')
@ApiBearerAuth()
@Controller('resposta-membro')
export class RespostaMembroController {
  constructor(private readonly respostaMembroService: RespostaMembroService) {}

  @ApiOperation({ summary: 'Criação de resposta do membro do clube' })
  @ApiResponse({ status: 201, description: 'Resposta criada com sucesso' })
  @Roles(TipoPerfil.ALUNO)
  @Post()
  create(
    @Body() createRespostaMembroDto: CreateRespostaMembroDto,
    @Req() request: RequestComUser,
  ) {
    return this.respostaMembroService.create(
      createRespostaMembroDto,
      request.user.id,
    );
  }

  @ApiOperation({ summary: 'Lista todas as respostas' })
  @ApiResponse({
    status: 200,
    description: 'Lista resposta retornada com sucesso',
  })
  @Roles(TipoPerfil.PROFESSOR, TipoPerfil.ALUNO)
  @Get()
  findAll(@Req() request: RequestComUser) {
    return this.respostaMembroService.findAll(
      request.user.id,
      request.user.perfil,
    );
  }

  @ApiOperation({ summary: 'Busca uma resposta pelo id' })
  @ApiResponse({ status: 200, description: 'Busca realizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  @Roles(TipoPerfil.PROFESSOR, TipoPerfil.ALUNO)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: RequestComUser) {
    return this.respostaMembroService.findOne(
      id,
      request.user.id,
      request.user.perfil,
    );
  }

  @ApiOperation({ summary: 'Remove uma Resposta' })
  @ApiResponse({ status: 200, description: 'Resposta removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Resposta não encontrada' })
  @Roles()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.respostaMembroService.remove(id);
  }
}