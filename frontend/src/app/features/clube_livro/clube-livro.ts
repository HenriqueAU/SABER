import { Component, inject, ViewChild, OnInit, signal, computed, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { MembroClubeService } from '../../../client/services/membroClube.service';
import { ClubesService } from '../../../client/services/clubes.service';
import { PerguntasService } from '../../../client/services/perguntas.service';
import { ItemPerguntaService } from '../../../client/services/itemPergunta.service';
import { RespostaMembroService } from '../../../client/services/respostaMembro.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import { TipoPerfil } from '../../core/auth/tipo-perfil.enum';
import { LivroGeneroService } from '../../../client';
import { SuccessModal } from '../../shared/components/success-modal/success-modal';

@Component({
  selector: 'app-clube-livro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SuccessModal],
  templateUrl: './clube-livro.html',
  styleUrls: ['./clube-livro.scss'],
})
export default class ClubeLivroComponent implements OnInit {
  modoListagem = signal(true);
  abaAtiva = signal<'detalhes' | 'feedbacks'>('detalhes');
  paginaAtual = signal(1);
  readonly itensPorPagina = 6;
  termoBusca = signal('');
  generoFiltro = signal('');

  filtroAbas = signal<'TODOS' | 'MEUS' | 'OUTROS'>('TODOS');

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

  jaAvaliado = signal(false);
@ViewChild('successModal') successModalRef!: ElementRef;


  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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
      .sort(),
  );

  eMembroDoClube = computed(() =>
    this.meusClubes().some((mc) => mc.id === this.clubeDetalhes()?.id),
  );

  clubesFiltrados = computed(() => {
    const usuarioId = this.authService.getId();
    const filtroAbasAtual = this.filtroAbas();

    return this.clubes().filter((c) => {
      const tituloLivro = c.livro?.titulo?.toLowerCase() || '';
      const nomeClube = c.nome?.toLowerCase() || '';
      const termo = this.termoBusca().toLowerCase();
      const matchNome = tituloLivro.includes(termo) || nomeClube.includes(termo);

      const generosDoLivro = c.livro?.id ? (this.generosPorLivro()[c.livro.id] ?? []) : [];
      const matchGenero = !this.generoFiltro() || generosDoLivro.includes(this.generoFiltro());

      if (!(matchNome && matchGenero)) return false;

      const souMembro =
        this.meusClubes().some((mc) => mc.id === c.id) ||
        c.membros?.some((m: any) => String(m.usuario_id) === String(usuarioId));

      const statusClube = this.obterStatusClube(c);
      if (statusClube === 'Encerrado' && !souMembro) return false;

      if (filtroAbasAtual === 'MEUS') return souMembro;
      if (filtroAbasAtual === 'OUTROS') return !souMembro;
      return true;
    });
  });

  totalPaginas = computed(
    () => Math.ceil(this.clubesFiltrados().length / this.itensPorPagina) || 1,
  );

  clubesPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    return this.clubesFiltrados().slice(inicio, inicio + this.itensPorPagina);
  });

  fimDaPagina = computed(() =>
    Math.min(this.paginaAtual() * this.itensPorPagina, this.clubesFiltrados().length),
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

  alterarFiltroAbas(tipo: 'TODOS' | 'MEUS' | 'OUTROS'): void {
    this.filtroAbas.set(tipo);
    this.paginaAtual.set(1);
  }

  obterStatusClube(clube: any): 'Ativo' | 'Encerrado' {
    if (!clube || !clube.ativo) return 'Encerrado';
    if (clube.data_fim) {
      const dataFim = new Date(clube.data_fim);
      if (dataFim < new Date()) return 'Encerrado';
    }
    return 'Ativo';
  }

  async entrarNoClube(clubeId: string | number) {
    const usuarioId = this.authService.getId();

    if (!usuarioId) {
      this.mensagemErro.set('Você precisa estar autenticado para entrar em um clube.');
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');
    this.mensagemSucesso.set('');

    try {
      await firstValueFrom(
        this.membroClubeService.membroClubeControllerCreate({
          clube_id: clubeId,
          usuario_id: usuarioId,
          status: 'confirmado',
        } as any),
      );
      this.mensagemSucesso.set('Inscrição realizada com sucesso!');
      await this.carregarMeusClubes();
    } catch (error) {
      this.mensagemErro.set('Ocorreu um erro ao tentar entrar no clube.');
    } finally {
      this.enviando.set(false);
    }
  }

  ngOnInit(): void {
    this.perfilUsuario = this.authService.getPerfil();
    this.form = this.fb.group({});

    this.route.paramMap.subscribe((params) => {
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
    this.carregandoMeusClubes.set(true);

    const precisaMeusClubes =
      this.perfilUsuario === TipoPerfil.ALUNO || this.perfilUsuario === TipoPerfil.PROFESSOR;

    const requisicaoMeusClubes = precisaMeusClubes
      ? this.perfilUsuario === TipoPerfil.PROFESSOR
        ? this.clubesService.clubeControllerFindClubesDoProfessor()
        : this.clubesService.clubeControllerFindMeusClubes()
      : null;

    try {
      if (requisicaoMeusClubes) {
        const [clubesRes, meusClubesRes] = await firstValueFrom(
          forkJoin([this.clubesService.clubeControllerFindAll(), requisicaoMeusClubes]),
        );

        this.clubes.set(Array.isArray(clubesRes) ? clubesRes : []);
        this.meusClubes.set(Array.isArray(meusClubesRes) ? meusClubesRes : []);
      } else {
        const clubesRes = await firstValueFrom(this.clubesService.clubeControllerFindAll());
        this.clubes.set(Array.isArray(clubesRes) ? clubesRes : []);
        this.meusClubes.set([]);
      }

      this.paginaAtual.set(1);
      this.carregarGeneros();
    } catch (error) {
      this.mensagemErro.set('Não foi possível carregar a lista de clubes.');
    } finally {
      this.carregando.set(false);
      this.carregandoMeusClubes.set(false);
    }
  }

  carregarGeneros(): void {
    this.livroGeneroService.livroGeneroControllerFindAll().subscribe({
      next: (relacoes) => {
        const mapa: Record<string, string[]> = {};
        relacoes.forEach((relacao: any) => {
          if (relacao.livro && relacao.genero) {
            const livroId = relacao.livro.id;
            const nomeGenero = relacao.genero.nome;
            if (!mapa[livroId]) mapa[livroId] = [];
            mapa[livroId].push(nomeGenero);
          }
        });
        this.generosPorLivro.set(mapa);
      },
      error: () => {
        this.generosPorLivro.set({});
      },
    });
  }

  async carregarMeusClubes(): Promise<void> {
    if (this.perfilUsuario !== TipoPerfil.ALUNO && this.perfilUsuario !== TipoPerfil.PROFESSOR)
      return;

    this.carregandoMeusClubes.set(true);
    try {
      const requisicao =
        this.perfilUsuario === TipoPerfil.PROFESSOR
          ? this.clubesService.clubeControllerFindClubesDoProfessor()
          : this.clubesService.clubeControllerFindMeusClubes();

      const res = await firstValueFrom(requisicao);
      this.meusClubes.set(Array.isArray(res) ? res : []);
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
      this.clubeDetalhes.set(
        await firstValueFrom(this.clubesService.clubeControllerFindOne(this.clubeId!)),
      );

      const detalhes = this.clubeDetalhes();
      this.clubeEncerrado.set(this.obterStatusClube(detalhes) === 'Encerrado');

      const todasPerguntas =
        (await firstValueFrom(this.perguntasService.perguntaControllerFindAll())) || [];

      const perguntasUnicas = Object.values(
        todasPerguntas.reduce((acc: any, p: any) => {
          if (!acc[p.texto] || new Date(p.created_at) > new Date(acc[p.texto].created_at)) {
            acc[p.texto] = p;
          }
          return acc;
        }, {}),
      );

      this.perguntas.set(perguntasUnicas);

      const todosItens =
        (await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll())) || [];

      const idsPerguntasUnicas = new Set(perguntasUnicas.map((p: any) => p.id));
      this.itensPergunta.set(
        todosItens.filter((item: any) => {
          const perguntaId = item.pergunta?.id || item.pergunta_id || item.pergunta;
          return idsPerguntasUnicas.has(perguntaId);
        }),
      );

      this.montarFormAvaliacao();
      await this.carregarMeusClubes();
      await this.verificarSeJaAvaliou();
    } catch (error) {
      this.mensagemErro.set('Não foi possível carregar os detalhes deste clube.');
    } finally {
      this.carregando.set(false);
    }
  }

  async verificarSeJaAvaliou(): Promise<void> {
    if (this.perfilUsuario !== TipoPerfil.ALUNO) return;

    try {
      const minhaInscricao = await firstValueFrom(
        this.membroClubeService.membroClubeControllerFindMinhaInscricao(this.clubeId!),
      );

      const respostas = await firstValueFrom(
        this.respostasService.respostaMembroControllerFindAll(),
      );
      const jaRespondeu = (Array.isArray(respostas) ? respostas : []).some((r: any) => {
        const membroId = r.membro?.id || r.membro_id;
        return membroId === minhaInscricao.id;
      });

      this.jaAvaliado.set(jaRespondeu);
    } catch {
      this.jaAvaliado.set(false);
    }
  }

  getItensDaPergunta(perguntaId: string): any[] {
    return this.itensPergunta().filter((item) => {
      const relacaoId = item.pergunta?.id || item.pergunta_id || item.pergunta;
      return relacaoId === perguntaId;
    });
  }

  montarFormAvaliacao(): void {
    Object.keys(this.form.controls).forEach((key) => this.form.removeControl(key));
    this.perguntas().forEach((pergunta) => {
      this.form.addControl(pergunta.id, this.fb.control('', Validators.required));
    });
  }

  abrirAvaliacao() {
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');
    this.form.reset();
    this.form.enable();
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
        this.membroClubeService.membroClubeControllerFindMinhaInscricao(this.clubeId!),
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

      Object.keys(respostasFormulario).forEach((perguntaId) => {
        requisicoes.push(
          this.respostasService.respostaMembroControllerCreate({
            membro_id: idDaInscricao,
            item_pergunta_id: respostasFormulario[perguntaId],
          } as any),
        );
      });

      if (requisicoes.length > 0) {
        forkJoin(requisicoes).subscribe({
          next: () => {
            this.jaAvaliado.set(true);
            this.enviando.set(false);


            const modalEl = document.getElementById('modalAvaliacao');
            if (modalEl) {
              const backdrop = document.querySelector('.modal-backdrop');
              modalEl.classList.remove('show');
              modalEl.style.display = 'none';
              document.body.classList.remove('modal-open');
              document.body.style.removeProperty('overflow');
              document.body.style.removeProperty('padding-right');
              if (backdrop) backdrop.remove();
            }


            this.mensagemSucesso.set('Avaliação enviada com sucesso! Obrigado pelo seu feedback.');
            setTimeout(() => {
              const modalSucesso = new (window as any).bootstrap.Modal(
                this.successModalRef.nativeElement,
              );
              modalSucesso.show();
            }, 300);
          },
          error: (err) => {
          const status = err?.status;
          if (status === 409) {

            this.jaAvaliado.set(true);
            this.enviando.set(false);

            const modalEl = document.getElementById('modalAvaliacao');
            if (modalEl) {
              const backdrop = document.querySelector('.modal-backdrop');
              modalEl.classList.remove('show');
              modalEl.style.display = 'none';
              document.body.classList.remove('modal-open');
              document.body.style.removeProperty('overflow');
              document.body.style.removeProperty('padding-right');
              if (backdrop) backdrop.remove();
            }

            this.mensagemSucesso.set('Você já avaliou este clube. Obrigado pelo feedback!');
            setTimeout(() => {
              const modalSucesso = new (window as any).bootstrap.Modal(
                this.successModalRef.nativeElement,
              );
              modalSucesso.show();
            }, 300);
          } else {
            this.mensagemErro.set('Ocorreu um erro ao enviar a avaliação.');
            this.enviando.set(false);
          }
        },
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
      this.respostasMembros.set(Array.isArray(res) ? res : []);
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

    this.estatisticas.set(
      itensDestaPergunta.map((item) => {
        const votos = this.respostasMembros().filter((resposta) => {
          const respostaItemId =
            resposta.itemPergunta?.id ||
            resposta.item_pergunta?.id ||
            resposta.item_pergunta_id ||
            resposta.item_pergunta;

          return respostaItemId === item.id;
        }).length;

        return { texto: item.texto, quantidade: votos };
      }),
    );
  }
  obterGeneroClube(c: any): string {
    const generos = c.livro?.id ? (this.generosPorLivro()[c.livro.id] ?? []) : [];
    return generos[0] ?? '';
  }

  getClasseGenero(genero: string): string {
    switch (genero) {
      case 'Poesia':
        return 'genero-poesia';
      case 'Romance':
        return 'genero-romance';
      case 'Tecnologia':
        return 'genero-tecnologia';
      case 'Aventura':
        return 'genero-aventura';
      case 'Ficção Científica':
        return 'genero-ficcao-cientifica';
      case 'Filosofia':
        return 'genero-filosofia';
      case 'História':
        return 'genero-historia';
      case 'Terror':
        return 'genero-terror';
      case 'Fantasia':
        return 'genero-fantasia';
      case 'Biografias':
        return 'genero-biografias';
      default:
        return 'bg-secondary text-white';
    }
  }
}
