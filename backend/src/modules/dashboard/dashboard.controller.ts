import { Controller, Get, Query, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import type { RequestComUser } from '../../common/interfaces/request-com-usuario.interface';
import { TipoPerfil } from '../usuario/usuario.entity';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('livros-mais-emprestados')
  @Roles(TipoPerfil.GESTOR, TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({
    summary: 'Ranking dos 5 livros mais emprestados da instituição',
  })
  livrosMaisEmprestados(@Req() request: RequestComUser) {
    const instituicaoId = request.user.instituicao;
    return this.dashboardService.livrosMaisEmprestados(instituicaoId);
  }

  @Get('generos-mais-procurados')
  @Roles(TipoPerfil.GESTOR, TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({
    summary: 'Gêneros mais procurados, com filtro opcional por faixa etária',
  })
  @ApiQuery({ name: 'faixaEtaria', required: false, example: '12+' })
  generosMaisProcurados(
    @Req() request: RequestComUser,
    @Query('faixaEtaria') faixaEtaria?: string,
  ) {
    const instituicaoId = request.user.instituicao;
    return this.dashboardService.generosMaisProcurados(
      instituicaoId,
      faixaEtaria,
    );
  }

  @Get('media-leitura')
  @Roles(TipoPerfil.GESTOR, TipoPerfil.BIBLIOTECARIO)
  @ApiOperation({
    summary: 'Comparativo de devoluções: mês atual vs mês anterior',
  })
  mediaLeitura(@Req() request: RequestComUser) {
    const instituicaoId = request.user.instituicao;
    return this.dashboardService.mediaLeitura(instituicaoId);
  }
}
