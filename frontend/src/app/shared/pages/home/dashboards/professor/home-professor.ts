import { Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ClubesService } from '../../../../../../client/services/clubes.service';
import { MembroClubeService } from '../../../../../../client/services/membroClube.service';
import { PerguntasService } from '../../../../../../client/services/perguntas.service';
import { ItemPerguntaService } from '../../../../../../client/services/itemPergunta.service';
import { RespostaMembroService } from '../../../../../../client/services/respostaMembro.service';
import { CoreAuthService } from '../../../../../core/auth/auth-session';
import { Router, ActivatedRoute } from '@angular/router';
import Modal from 'bootstrap/js/dist/modal';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LivrosService } from '../../../../../../client';
import { SuccessModal } from '../../../../components/success-modal/success-modal';

@Component({
  selector: 'app-home-professor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SuccessModal],
  templateUrl: './home-professor.html',
  styleUrls: ['../../../../../features/clube_livro/clube-livro.scss'],
})
export default class HomeProfessorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clubesService = inject(ClubesService);
  private membroClubeService = inject(MembroClubeService);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemPerguntaService);
  private respostasService = inject(RespostaMembroService);
  private authService = inject(CoreAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private livroService = inject(LivrosService);

  modoListagem = signal<boolean>(true);
  abaAtiva = signal<'detalhes' | 'feedbacks'>('detalhes');

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

  paginaAtualAlunos = signal<number>(1);
  itensPorPaginaAlunos = 5;

  termoBusca = signal('');
  filtroStatus = signal<'TODOS' | 'ATIVOS' | 'ENCERRADOS'>('TODOS');

  livros = signal<any[]>([]);
  enviandoClube = signal(false);
  erroClube = signal('');
  livrosFiltrados = signal<any[]>([]);

  @ViewChild('feedbackModal')
  feedbackModalRef!: ElementRef;

  @ViewChild('clubeFormModal')
  clubeFormModalRef!: ElementRef;

  @ViewChild('successModalElement') successModalElement!: ElementRef;
  mensagemSucessoModal = signal<string>('');

  clubeForm: FormGroup = this.fb.group({
    livro_busca: [''],
    livro_id: ['', Validators.required],
    nome: ['', Validators.required],
    data_inicio: [''],
    data_fim: ['', Validators.required],
    local_encontro: [''],
  });

  get membrosPaginados(): any[] {
    const inicio = (this.paginaAtualAlunos() - 1) * this.itensPorPaginaAlunos;
    const fim = inicio + this.itensPorPaginaAlunos;
    return this.membrosDoClube().slice(inicio, fim);
  }

  get totalPaginasAlunos(): number {
    return Math.ceil(this.membrosDoClube().length / this.itensPorPaginaAlunos);
  }

  get paginasExibidasAlunos(): (number | string)[] {
    const total = this.totalPaginasAlunos;
    const atual = this.paginaAtualAlunos();
    const paginas: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        paginas.push(i);
      }
    } else {
      if (atual <= 4) {
        paginas.push(1, 2, 3, 4, 5, '...', total);
      } else if (atual >= total - 3) {
        paginas.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      } else {
        paginas.push(1, '...', atual - 1, atual, atual + 1, '...', total);
      }
    }
    return paginas;
  }

  mudarPaginaAlunos(pagina: number | string, event?: Event) {
    if (event) event.preventDefault();
    if (typeof pagina === 'number' && pagina >= 1 && pagina <= this.totalPaginasAlunos) {
      this.paginaAtualAlunos.set(pagina);
    }
  }

  ngOnInit(): void {
    this.carregarMeusClubes();
  }

  carregarLivrosParaSelecaoDeClube() {
    this.livroService.livroControllerFindAll().subscribe({
      next: (dados) => this.livros.set(dados),
    });
  }

  filtrarLivrosParaSelecao() {
    const termo = (this.clubeForm.get('livro_busca')?.value || '').toLowerCase();

    if (!termo) {
      this.livrosFiltrados.set([]);
      return;
    }

    this.livrosFiltrados.set(this.livros().filter((l) => l.titulo.toLowerCase().includes(termo)));
  }

  selecionarLivro(livro: any) {
    this.clubeForm.patchValue({
      livro_id: livro.id,
      livro_busca: livro.titulo,
    });
    this.livrosFiltrados.set([]);
  }

  abrirClubeFormModal() {
    this.clubeForm.reset();
    this.livrosFiltrados.set([]);
    this.erroClube.set('');
    if (this.livros().length === 0) {
      this.carregarLivrosParaSelecaoDeClube();
    }
    const modal = new Modal(this.clubeFormModalRef.nativeElement);
    modal.show();
  }

  criarClube() {
    if (this.clubeForm.invalid) {
      this.clubeForm.markAllAsTouched();
      return;
    }
    this.enviandoClube.set(true);
    this.erroClube.set('');
    const valores = this.clubeForm.value;
    const payload = {
      professor_id: this.authService.getId(),
      nome: valores.nome,
      livro_id: valores.livro_id,
      data_inicio: valores.data_inicio || undefined,
      data_fim: valores.data_fim,
      local_encontro: valores.local_encontro || undefined,
    };
    this.clubesService.clubeControllerCreate(payload as any).subscribe({
      next: () => {
        this.enviandoClube.set(false);
        const modal = Modal.getInstance(this.clubeFormModalRef.nativeElement);
        modal?.hide();
        this.carregarMeusClubes();

        this.mensagemSucessoModal.set('Clube de leitura criado com sucesso!');
        const successModal = new Modal(this.successModalElement.nativeElement);
        successModal.show();
      },
      error: (err) => {
        this.enviandoClube.set(false);
        this.erroClube.set(err.error?.message ?? 'Não foi possível criar o clube');
      },
    });
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

  obterStatusClube(clube: any): string {
    if (!clube || !clube.data_fim) return 'Ativo';

    const dataFim = new Date(clube.data_fim);
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);
    dataFim.setHours(0, 0, 0, 0);

    return dataFim < hoje ? 'Encerrado' : 'Ativo';
  }

  async carregarMeusClubes() {
    this.carregando.set(true);
    this.mensagemErro.set('');
    try {
      const res = await firstValueFrom(this.clubesService.clubeControllerFindClubesDoProfessor());
      const filtrados = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
      this.clubes.set(filtrados);
      const clubeIdAcao = this.route.snapshot.queryParams['abrirClubeFeedbacks'];
      if (clubeIdAcao) {
        const clubeAlvo = filtrados.find((c: any) => c.id === clubeIdAcao);

        if (clubeAlvo) {
          this.abrirClube(clubeAlvo);

          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { abrirClubeFeedbacks: null },
            queryParamsHandling: 'merge',
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

  clubesFiltrados = computed(() => {
    const termo = this.termoBusca().toLowerCase();
    const status = this.filtroStatus();

    return this.clubes().filter((c) => {
      const tituloOk = !termo || c.livro?.titulo?.toLowerCase().includes(termo);

      const encerrado = !c.ativo || (c.data_fim && new Date(c.data_fim) < new Date());
      const statusOk =
        status === 'TODOS' ||
        (status === 'ATIVOS' && !encerrado) ||
        (status === 'ENCERRADOS' && encerrado);

      return tituloOk && statusOk;
    });
  });

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
    this.paginaAtualAlunos.set(1);
  }

  async carregarDadosExtras(clubeId: string) {
    this.carregandoMembros.set(true);
    this.erroMembros.set('');

    try {
      const resMembros = await firstValueFrom(
        this.membroClubeService.membroClubeControllerFindAll(clubeId),
      );
      this.membrosDoClube.set(
        Array.isArray(resMembros)
          ? resMembros
          : (resMembros as any)?.data || (resMembros as any)?.items || [],
      );

      const resPerguntas = await firstValueFrom(this.perguntasService.perguntaControllerFindAll());
      const todasPerguntas = resPerguntas || [];

    
      const perguntasUnicas = Object.values(
        todasPerguntas.reduce((acc: any, p: any) => {
          if (!acc[p.texto] || new Date(p.created_at) > new Date(acc[p.texto].created_at)) {
            acc[p.texto] = p;
          }
          return acc;
        }, {}),
      );

      this.perguntas.set(perguntasUnicas);

      const resItens = await firstValueFrom(
        this.itemPerguntaService.itemPerguntaControllerFindAll(),
      );
      const todosItens = resItens || [];

      
      const idsPerguntasUnicas = new Set(perguntasUnicas.map((p: any) => p.id));
      this.itensPergunta.set(
        todosItens.filter((item: any) => {
          const perguntaId = item.pergunta?.id || item.pergunta_id || item.pergunta;
          return idsPerguntasUnicas.has(perguntaId);
        }),
      );
    } catch (err) {
      this.erroMembros.set('Não foi possível carregar as informações complementares do clube.');
    } finally {
      this.carregandoMembros.set(false);
    }
  }

  getItensDaPergunta(perguntaId: string): any[] {
    return this.itensPergunta().filter((item) => {
      const relacaoId = item.pergunta?.id || item.pergunta_id || item.pergunta;
      return relacaoId === perguntaId;
    });
  }

  async abrirFeedbacks() {
    this.perguntaSelecionadaId.set(null);
    this.carregando.set(true);

    try {
      const res = await firstValueFrom(this.respostasService.respostaMembroControllerFindAll());
      this.respostasMembros.set(
        Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [],
      );
      const modal = new Modal(this.feedbackModalRef.nativeElement);
      modal.show();
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

    const membrosIds = this.membrosDoClube().map((m: any) => m.id);
    const respostas = this.respostasMembros().filter((r) => {
      const membroId =
        r.membro_clube?.id ||
        r.membro_clube_id ||
        r.membroClube?.id ||
        r.membroClube ||
        r.membro?.id;
      return membrosIds.includes(membroId);
    });

    const stats = itensDestaPergunta.map((item) => {
      const votos = respostas.filter((resposta) => {
        const respostaItemId =
          resposta.itemPergunta?.id ||
          resposta.item_pergunta?.id ||
          resposta.item_pergunta_id ||
          resposta.item_pergunta;
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
