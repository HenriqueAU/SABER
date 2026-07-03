import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ClubesService } from '../../../../../../client/services/clubes.service';
import { MembroClubeService } from '../../../../../../client/services/membroClube.service';
import { PerguntasService } from '../../../../../../client/services/perguntas.service';
import { ItemPerguntaService } from '../../../../../../client/services/itemPergunta.service';
import { RespostaMembroService } from '../../../../../../client/services/respostaMembro.service';
import { CoreAuthService } from '../../../../../core/auth/auth-session';

@Component({
  selector: 'app-home-professor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-professor.html',
  styleUrls: ['../../../../../features/clube_livro/clube-livro.scss']
})
export default class HomeProfessorComponent implements OnInit {
  modoListagem: boolean = true;
  abaAtiva: 'detalhes' | 'feedbacks' = 'detalhes';

  professorId: string = '';
  clubes: any[] = [];
  clubeDetalhes: any = null;
  membrosDoClube: any[] = [];
  
  perguntas: any[] = [];
  itensPergunta: any[] = [];
  respostasMembros: any[] = [];
  perguntaSelecionadaId: string | null = null;
  estatisticas: any[] = [];
  clubeEncerrado: boolean = false;

  carregando: boolean = true;
  carregandoMembros: boolean = false;
  mensagemErro: string = '';
  erroMembros: string = '';

  private cdr = inject(ChangeDetectorRef);
  private clubesService = inject(ClubesService);
  private membroClubeService = inject(MembroClubeService);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemPerguntaService);
  private respostasService = inject(RespostaMembroService);
  private authService = inject(CoreAuthService);

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.professorId = payload.id;
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
    this.carregando = true;
    this.mensagemErro = '';
    try {
      const res = await firstValueFrom(this.clubesService.clubeControllerFindAll());
      const todosClubes = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];

      this.clubes = todosClubes.filter((c: any) => 
        c.professor?.id === this.professorId || c.professor_id === this.professorId || c.professor === this.professorId
      );
    } catch (error) {
      this.mensagemErro = 'Não foi possível carregar os seus clubes de leitura.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  abrirClube(clube: any) {
    this.clubeDetalhes = clube;
    this.modoListagem = false;
    this.abaAtiva = 'detalhes';
    
    if (this.clubeDetalhes?.data_fim) {
      const dataFim = new Date(this.clubeDetalhes.data_fim);
      this.clubeEncerrado = new Date() > dataFim;
    } else {
      this.clubeEncerrado = false;
    }

    this.carregarDadosExtras(clube.id);
  }

  voltarParaListagem() {
    this.modoListagem = true;
    this.clubeDetalhes = null;
    this.membrosDoClube = [];
  }

  async carregarDadosExtras(clubeId: string) {
    this.carregandoMembros = true;
    this.erroMembros = '';
    
    try {
      const resMembros = await firstValueFrom(this.membroClubeService.membroClubeControllerFindAll(clubeId));
      this.membrosDoClube = Array.isArray(resMembros) ? resMembros : (resMembros as any)?.data || (resMembros as any)?.items || [];
      
      const resPerguntas = await firstValueFrom(this.perguntasService.perguntaControllerFindAll());
      this.perguntas = resPerguntas || [];

      const resItens = await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll());
      this.itensPergunta = resItens || [];
    } catch (err) {
      this.erroMembros = 'Não foi possível carregar as informações complementares do clube.';
    } finally {
      this.carregandoMembros = false;
      this.cdr.detectChanges();
    }
  }

  getItensDaPergunta(perguntaId: string): any[] {
    return this.itensPergunta.filter(item => {
      const relacaoId = item.pergunta?.id || item.pergunta_id || item.pergunta;
      return relacaoId === perguntaId;
    });
  }

  async abrirFeedbacks() {
    this.abaAtiva = 'feedbacks';
    this.perguntaSelecionadaId = null;
    this.carregando = true;

    try {
      const res = await firstValueFrom(this.respostasService.respostaMembroControllerFindAll());
      this.respostasMembros = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
    } catch (error) {
      this.mensagemErro = 'Erro ao buscar respostas dos alunos.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  selecionarPerguntaParaAnalise(perguntaId: string) {
    if (this.perguntaSelecionadaId === perguntaId) {
      this.perguntaSelecionadaId = null;
      return;
    }

    this.perguntaSelecionadaId = perguntaId;
    const itensDestaPergunta = this.getItensDaPergunta(perguntaId);

    this.estatisticas = itensDestaPergunta.map(item => {
      const votos = this.respostasMembros.filter(resposta => {
        const respostaItemId = resposta.itemPergunta?.id || resposta.item_pergunta?.id || resposta.item_pergunta_id || resposta.item_pergunta;
        return respostaItemId === item.id;
      }).length;
      return { texto: item.texto, quantidade: votos };
    });
  }

  voltarParaDetalhes() {
    this.abaAtiva = 'detalhes';
    this.perguntaSelecionadaId = null;
  }
}