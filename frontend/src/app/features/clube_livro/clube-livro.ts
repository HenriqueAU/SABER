import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, forkJoin } from 'rxjs';
import { MembroClubeService } from '../../../client/services/membroClube.service';
import { ClubesService } from '../../../client/services/clubes.service';
import { PerguntasService } from '../../../client/services/perguntas.service';
import { ItemPerguntaService } from '../../../client/services/itemPergunta.service';
import { RespostaMembroService } from '../../../client/services/respostaMembro.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import { TipoPerfil } from '../../core/auth/tipo-perfil.enum';
import { LivroGeneroService } from '../livro/generos/livro-genero.service';

@Component({
  selector: 'app-clube-livro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './clube-livro.html',
  styleUrls: ['./clube-livro.scss']
})
export default class ClubeLivroComponent implements OnInit {
  modoListagem = signal(true);
  abaAtiva = signal<'detalhes' | 'avaliacao' | 'feedbacks'>('detalhes');
  paginaAtual = signal(1);
  readonly itensPorPagina = 12;
  termoBusca = signal('');
  generoFiltro = signal('');
  clubes = signal<any[]>([]);
  meusClubes = signal<any[]>([]);
  carregandoMeusClubes = signal(false);
  clubeDetalhes = signal<any>(null);
  perguntas = signal<any[]>([]);
  itensPergunta = signal<any[]>([]);
  respostasMembros = signal<any[]>([]);
  clubeId: string | null = null;
  clubeEncerrado = signal(false);
  perguntaSelecionadaId = signal<string | null>(null);
  estatisticas = signal<any[]>([]);
  form!: FormGroup;
  carregando = signal(false);
  enviando = signal(false);
  mensagemSucesso = signal('');
  mensagemErro = signal('');

  perfilUsuario: TipoPerfil | null = null;
  TipoPerfilEnum = TipoPerfil;

  generosPorLivro = signal<Record<string, string[]>>({});

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private clubesService = inject(ClubesService);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemPerguntaService);
  private respostasService = inject(RespostaMembroService);
  private authService = inject(CoreAuthService);
  private membroClubeService = inject(MembroClubeService);
  private livroGeneroService = inject(LivroGeneroService);

  generosDisponiveis = computed(() =>
    Object.values(this.generosPorLivro())
      .flat()
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort()
  );

  clubesFiltrados = computed(() =>
    this.clubes().filter(c => {
      const tituloLivro = c.livro?.titulo?.toLowerCase() || '';
      const nomeClube = c.nome?.toLowerCase() || '';
      const termo = this.termoBusca().toLowerCase();
      const matchNome = tituloLivro.includes(termo) || nomeClube.includes(termo);
      const generosDoLivro = c.livro?.id ? (this.generosPorLivro()[c.livro.id] ?? []) : [];
      const matchGenero = !this.generoFiltro() || generosDoLivro.includes(this.generoFiltro());
      return matchNome && matchGenero;
    })
  );

  totalPaginas = computed(() =>
    Math.ceil(this.clubesFiltrados().length / this.itensPorPagina) || 1
  );

  clubesPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.clubesFiltrados().slice(inicio, inicio + this.itensPorPagina);
  });

  fimDaPagina = computed(() =>
    Math.min(this.paginaAtual() * this.itensPorPagina, this.clubesFiltrados().length)
  );

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual.set(pagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onFiltroChange(): void {
    this.paginaAtual.set(1);
  }

  ngOnInit(): void {
    this.perfilUsuario = this.authService.getPerfil();
    this.form = this.fb.group({});

    this.route.paramMap.subscribe(params => {
      this.clubeId = params.get('id');
      if (this.clubeId) {
        this.modoListagem.set(false);
        this.abaAtiva.set('detalhes');
        this.carregarDetalhes();
      } else {
        this.modoListagem.set(true);
        this.carregarClubes();
      }
    });
  }

  async carregarClubes() {
    this.carregando.set(true);
    try {
      const res = await firstValueFrom(this.clubesService.clubeControllerFindAll());
      this.clubes.set(Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || []);
      this.paginaAtual.set(1);
      this.carregarGeneros();
      this.carregarMeusClubes();
    } catch (error) {
      this.mensagemErro.set('Não foi possível carregar a lista de clubes.');
    } finally {
      this.carregando.set(false);
    }
  }

  carregarGeneros(): void {
    this.livroGeneroService.listar().subscribe({
      next: (relacoes) => {
        const mapa: Record<string, string[]> = {};
        relacoes.forEach((relacao: any) => {
          const livroId = relacao.livro.id;
          const nomeGenero = relacao.genero.nome;
          if (!mapa[livroId]) mapa[livroId] = [];
          mapa[livroId].push(nomeGenero);
        });
        this.generosPorLivro.set(mapa);
      },
      error: () => {
        this.generosPorLivro.set({});
      }
    });
  }

  async carregarMeusClubes(): Promise<void> {
    if (this.perfilUsuario !== TipoPerfil.ALUNO && this.perfilUsuario !== TipoPerfil.PROFESSOR) return;

    this.carregandoMeusClubes.set(true);
    try {
      const endpoint = this.perfilUsuario === TipoPerfil.PROFESSOR
        ? 'meus-clubes-professor'
        : 'meus-clubes';

      const res = await firstValueFrom(
        this.http.get<any[]>(`${this.clubesService['basePath']}/clubes/${endpoint}`)
      );
      this.meusClubes.set(Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || []);
    } catch (error) {
      this.meusClubes.set([]);
    } finally {
      this.carregandoMeusClubes.set(false);
    }
  }

  abrirClube(id: string) {
    this.router.navigate(['/clubes', id]);
  }

  voltarParaListagem() {
    this.router.navigate(['/clubes']);
  }

  async carregarDetalhes() {
    this.carregando.set(true);
    this.mensagemSucesso.set('');

    try {
      this.clubeDetalhes.set(await firstValueFrom(this.clubesService.clubeControllerFindOne(this.clubeId!)));

      const detalhes = this.clubeDetalhes();
      if (detalhes?.data_fim) {
        this.clubeEncerrado.set(new Date() > new Date(detalhes.data_fim));
      } else {
        this.clubeEncerrado.set(false);
      }

      this.perguntas.set(await firstValueFrom(this.perguntasService.perguntaControllerFindAll()) || []);
      this.itensPergunta.set(await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll()) || []);

    } catch (error) {
      this.mensagemErro.set('Não foi possível carregar os detalhes deste clube.');
    } finally {
      this.carregando.set(false);
    }
  }

  getItensDaPergunta(perguntaId: string): any[] {
    return this.itensPergunta().filter(item => {
      const relacaoId = item.pergunta?.id || item.pergunta_id || item.pergunta;
      return relacaoId === perguntaId;
    });
  }

  abrirAvaliacao() {
    this.abaAtiva.set('avaliacao');
    this.mensagemSucesso.set('');
    Object.keys(this.form.controls).forEach(key => this.form.removeControl(key));
    this.perguntas().forEach(pergunta => {
      this.form.addControl(pergunta.id, this.fb.control('', Validators.required));
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');

    let idDaInscricao = '';
    try {
      const minhaInscricao = await firstValueFrom(
        this.membroClubeService.membroClubeControllerFindMinhaInscricao(this.clubeId!)
      );
      idDaInscricao = minhaInscricao.id;
    } catch (error) {
      this.mensagemErro.set('Apenas membros matriculados neste clube podem enviar avaliações.');
      this.enviando.set(false);
      return;
    }

    try {
      const respostasFormulario = this.form.value;
      const requisicoes: any[] = [];

      Object.keys(respostasFormulario).forEach(perguntaId => {
        requisicoes.push(this.respostasService.respostaMembroControllerCreate({
          membro_id: idDaInscricao,
          item_pergunta_id: respostasFormulario[perguntaId]
        } as any));
      });

      if (requisicoes.length > 0) {
        forkJoin(requisicoes).subscribe({
          next: () => {
            this.mensagemSucesso.set('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
            this.form.disable();
            this.enviando.set(false);
          },
          error: () => {
            this.mensagemErro.set('Ocorreu um erro ao enviar a avaliação.');
            this.enviando.set(false);
          }
        });
      } else {
        this.enviando.set(false);
      }
    } catch (error) {
      this.mensagemErro.set('Ocorreu um erro de comunicação com o servidor.');
      this.enviando.set(false);
    }
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

    this.estatisticas.set(itensDestaPergunta.map(item => {
      const votos = this.respostasMembros().filter(resposta => {
        const respostaItemId = resposta.itemPergunta?.id
                            || resposta.item_pergunta?.id
                            || resposta.item_pergunta_id
                            || resposta.item_pergunta;

        return respostaItemId === item.id;
      }).length;

      return { texto: item.texto, quantidade: votos };
    }));
  }
}
