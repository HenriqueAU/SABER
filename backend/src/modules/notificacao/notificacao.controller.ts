import { Controller, Get, Post, Body, Patch, Delete, Param, Req } from '@nestjs/common';
import { NotificacaoService } from './notificacao.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';

@ApiTags('Notificacoes')
@ApiBearerAuth()
@Controller('notificacoes')
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma notificação (Uso interno do sistema)' })
  create(@Body() createNotificacaoDto: CreateNotificacaoDto) {
    return this.notificacaoService.create(createNotificacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Buscar notificações do usuário logado' })
  findAll(@Req() request: RequestComUser) {
    const usuarioId = request.user.id;
    return this.notificacaoService.findAllByUser(usuarioId);
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  markAsRead(@Param('id') id: string, @Req() request: RequestComUser) {
    const usuarioId = request.user.id;
    return this.notificacaoService.markAsRead(id, usuarioId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma notificação' })
  remove(@Param('id') id: string) {
    return this.notificacaoService.remove(id);
  }
}
