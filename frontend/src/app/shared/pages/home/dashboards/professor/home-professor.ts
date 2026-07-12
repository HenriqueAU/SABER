import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ClubesService } from '../../../../../../client/services/clubes.service';
import { MembroClubeService } from '../../../../../../client/services/membroClube.service';
import { PerguntasService } from '../../../../../../client/services/perguntas.service';
import { ItemPerguntaService } from '../../../../../../client/services/itemPergunta.service';
import { RespostaMembroService } from '../../../../../../client/services/respostaMembro.service';
import { CoreAuthService } from '../../../../../core/auth/auth-session';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home-professor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-professor.html',
  styleUrls: ['../../../../../features/clube_livro/clube-livro.scss']
})
export default class HomeProfessorComponent implements OnInit {
  modoListagem = signal<boolean>(true);
  abaAtiva = signal<'detalhes' | 'feedbacks'>('detalhes');

  professorId = signal<string>('');
  clubes = signal<any[]>([]);
  clubeDetalhes = signal<any>(null);
  membrosDoClube = signal<any[]>([]);

  perguntas = signal<any[]>([]);
  itensPergunta = signal<any[]>([]);
  respostasMembros = signal<any[]>([]);
  perguntaSelecionadaId = signal<string | null>(null);
  estatisticas = signal<any[]>([]);
  clubeEncerrado = signal<boolean>(false);

  carregando = signal<boolean>(true);
  carregandoMembros = signal<boolean>(false);
  mensagemErro = signal<string>('');
  erroMembros = signal<string>('');

  private clubesService = inject(ClubesService);
  private membroClubeService = inject(MembroClubeService);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemPerguntaService);
  private respostasService = inject(RespostaMembroService);
  private authService = inject(CoreAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const professorId = this.authService.getId()
    if (professorId) {
      this.professorId.set(professorId);
    }
    this.carregarMeusClubes();
  }

  getDiasParaInicio(dataInicio: string | Date): number | null {
    if (!dataInicio) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(dataInicio);
    inicio.setHours(0, 0, 0, 0);

    const diffTime = inicio.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : null;
  }

  async carregarMeusClubes() {
    this.carregando.set(true);
    this.mensagemErro.set('');
    try {
      const res = await firstValueFrom(this.clubesService.clubeControllerFindAll());
      const todosClubes = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
      const profId = this.professorId();
      const filtrados = todosClubes.filter((c: any) =>
        c.professor?.id === profId || c.professor_id === profId || c.professor === profId
      );
      this.clubes.set(filtrados);
      const clubeIdAcao = this.route.snapshot.queryParams['abrirClubeFeedbacks'];
      if (clubeIdAcao) {
        const clubeAlvo = filtrados.find((c: any) => c.id === clubeIdAcao);

        if (clubeAlvo) {
          this.abrirClube(clubeAlvo);

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { abrirClubeFeedbacks: null },
            queryParamsHandling: 'merge'
          });

          setTimeout(() => {
            this.abrirFeedbacks();
          }, 300);
        }
      }
    } catch (error) {
      this.mensagemErro.set('Não foi possível carregar os seus clubes de leitura.');
    } finally {
      this.carregando.set(false);
    }
  }

  abrirClube(clube: any) {
    this.clubeDetalhes.set(clube);
    this.modoListagem.set(false);
    this.abaAtiva.set('detalhes');

    if (clube?.data_fim) {
      const dataFim = new Date(clube.data_fim);
      this.clubeEncerrado.set(new Date() > dataFim);
    } else {
      this.clubeEncerrado.set(false);
    }

    this.carregarDadosExtras(clube.id);
  }

  voltarParaListagem() {
    this.modoListagem.set(true);
    this.clubeDetalhes.set(null);
    this.membrosDoClube.set([]);
  }

  async carregarDadosExtras(clubeId: string) {
    this.carregandoMembros.set(true);
    this.erroMembros.set('');

    try {
      const resMembros = await firstValueFrom(this.membroClubeService.membroClubeControllerFindAll(clubeId));
      this.membrosDoClube.set(Array.isArray(resMembros) ? resMembros : (resMembros as any)?.data || (resMembros as any)?.items || []);

      const resPerguntas = await firstValueFrom(this.perguntasService.perguntaControllerFindAll());
      this.perguntas.set(resPerguntas || []);

      const resItens = await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll());
      this.itensPergunta.set(resItens || []);
    } catch (err) {
      this.erroMembros.set('Não foi possível carregar as informações complementares do clube.');
    } finally {
      this.carregandoMembros.set(false);
    }
  }

  getItensDaPergunta(perguntaId: string): any[] {
    return this.itensPergunta().filter(item => {
      const relacaoId = item.pergunta?.id || item.pergunta_id || item.pergunta;
      return relacaoId === perguntaId;
    });
  }

  async abrirFeedbacks() {
    this.abaAtiva.set('feedbacks');
    this.perguntaSelecionadaId.set(null);
    this.carregando.set(true);

    try {
      const res = await firstValueFrom(this.respostasService.respostaMembroControllerFindAll());
      this.respostasMembros.set(Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || []);
    } catch (error) {
      this.mensagemErro.set('Erro ao buscar respostas dos alunos.');
    } finally {
      this.carregando.set(false);
    }
  }

  selecionarPerguntaParaAnalise(perguntaId: string) {
    if (this.perguntaSelecionadaId() === perguntaId) {
      this.perguntaSelecionadaId.set(null);
      return;
    }

    this.perguntaSelecionadaId.set(perguntaId);
    const itensDestaPergunta = this.getItensDaPergunta(perguntaId);
    const respostas = this.respostasMembros();

    const stats = itensDestaPergunta.map(item => {
      const votos = respostas.filter(resposta => {
        const respostaItemId = resposta.itemPergunta?.id || resposta.item_pergunta?.id || resposta.item_pergunta_id || resposta.item_pergunta;
        return respostaItemId === item.id;
      }).length;
      return { texto: item.texto, quantidade: votos };
    });
    this.estatisticas.set(stats);
  }

  voltarParaDetalhes() {
    this.abaAtiva.set('detalhes');
    this.perguntaSelecionadaId.set(null);
  }
}
