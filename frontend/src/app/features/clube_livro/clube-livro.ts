import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
  modoListagem: boolean = true;
  abaAtiva: 'detalhes' | 'avaliacao' | 'feedbacks' = 'detalhes';
  paginaAtual: number = 1;
  readonly itensPorPagina: number = 12;
  termoBusca: string = '';
  generoFiltro: string = '';
  clubes: any[] = [];
  clubeDetalhes: any = null;
  perguntas: any[] = [];
  itensPergunta: any[] = [];
  respostasMembros: any[] = [];
  clubeId: string | null = null;
  clubeEncerrado: boolean = false;
  perguntaSelecionadaId: string | null = null;
  estatisticas: any[] = [];
  form!: FormGroup;
  carregando: boolean = false;
  enviando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  
  perfilUsuario: TipoPerfil | null = null;
  TipoPerfilEnum = TipoPerfil;

  generosPorLivro: Record<string, string[]> = {};

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private http = inject(HttpClient);
  private clubesService = inject(ClubesService);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemPerguntaService);
  private respostasService = inject(RespostaMembroService);
  private authService = inject(CoreAuthService);
  private membroClubeService = inject(MembroClubeService);
  private livroGeneroService = inject(LivroGeneroService);

  get generosDisponiveis(): string[] {
    return Object.values(this.generosPorLivro)
      .flat()
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort();
  }

  get clubesFiltrados(): any[] {
    return this.clubes.filter(c => {
      const tituloLivro = c.livro?.titulo?.toLowerCase() || '';
      const nomeClube = c.nome?.toLowerCase() || '';
      const termo = this.termoBusca.toLowerCase();
      const matchNome = tituloLivro.includes(termo) || nomeClube.includes(termo);

      const generosDoLivro = c.livro?.id ? (this.generosPorLivro[c.livro.id] ?? []) : [];
      const matchGenero = !this.generoFiltro || generosDoLivro.includes(this.generoFiltro);

      return matchNome && matchGenero;
    });
  }

  get totalPaginas(): number {
    return Math.ceil(this.clubesFiltrados.length / this.itensPorPagina) || 1;
  }

  get clubesPaginados(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return this.clubesFiltrados.slice(inicio, inicio + this.itensPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  get fimDaPagina(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.clubesFiltrados.length);
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onFiltroChange(): void {
    this.paginaAtual = 1;
  }

  ngOnInit(): void {
    this.perfilUsuario = this.authService.getPerfil();
    this.form = this.fb.group({});

    this.route.paramMap.subscribe(params => {
      this.clubeId = params.get('id');
      if (this.clubeId) {
        this.modoListagem = false;
        this.abaAtiva = 'detalhes';
        this.carregarDetalhes();
      } else {
        this.modoListagem = true;
        this.carregarClubes();
      }
    });
  }

  async carregarClubes() {
    this.carregando = true;
    try {
      const res = await firstValueFrom(this.clubesService.clubeControllerFindAll());
      this.clubes = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
      this.paginaAtual = 1;
      this.carregarGeneros();
    } catch (error) {
      this.mensagemErro = 'Não foi possível carregar a lista de clubes.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  carregarGeneros(): void {
    this.livroGeneroService.listar().subscribe({
      next: (relacoes) => {
        this.generosPorLivro = {};
        relacoes.forEach((relacao: any) => {
          const livroId = relacao.livro.id;
          const nomeGenero = relacao.genero.nome;
          if (!this.generosPorLivro[livroId]) {
            this.generosPorLivro[livroId] = [];
          }
          this.generosPorLivro[livroId].push(nomeGenero);
        });
        this.cdr.detectChanges();
      }
    });
  }

  abrirClube(id: string) {
    this.router.navigate(['/clubes', id]);
  }

  voltarParaListagem() {
    this.router.navigate(['/clubes']);
  }

  async carregarDetalhes() {
    this.carregando = true;
    this.mensagemSucesso = '';

    try {
      this.clubeDetalhes = await firstValueFrom(this.clubesService.clubeControllerFindOne(this.clubeId!));

      if (this.clubeDetalhes?.data_fim) {
        const dataFim = new Date(this.clubeDetalhes.data_fim);
        this.clubeEncerrado = new Date() > dataFim;
      } else {
        this.clubeEncerrado = false;
      }

      const resPerguntas = await firstValueFrom(this.perguntasService.perguntaControllerFindAll());
      this.perguntas = resPerguntas || [];

      const resItens = await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll());
      this.itensPergunta = resItens || [];

    } catch (error) {
      this.mensagemErro = 'Não foi possível carregar os detalhes deste clube.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  getItensDaPergunta(perguntaId: string): any[] {
    return this.itensPergunta.filter(item => {
      const relacaoId = item.pergunta?.id || item.pergunta_id || item.pergunta;
      return relacaoId === perguntaId;
    });
  }

  abrirAvaliacao() {
    this.abaAtiva = 'avaliacao';
    this.mensagemSucesso = '';

    Object.keys(this.form.controls).forEach(key => this.form.removeControl(key));
    this.perguntas.forEach(pergunta => {
      this.form.addControl(pergunta.id, this.fb.control('', Validators.required));
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensagemErro = '';

    let idDaInscricao = '';
    try {
      const minhaInscricao = await firstValueFrom(
        this.membroClubeService.membroClubeControllerFindMinhaInscricao(this.clubeId!)
      );
      idDaInscricao = minhaInscricao.id;
    } catch (error) {
      this.mensagemErro = 'Apenas membros matriculados neste clube podem enviar avaliações.';
      this.enviando = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      const respostasFormulario = this.form.value;
      const requisicoes: any[] = [];

      Object.keys(respostasFormulario).forEach(perguntaId => {
        const payload = {
          membro_id: idDaInscricao,
          item_pergunta_id: respostasFormulario[perguntaId]
        } as any;

        requisicoes.push(this.respostasService.respostaMembroControllerCreate(payload));
      });

      if (requisicoes.length > 0) {
        forkJoin(requisicoes).subscribe({
          next: () => {
            this.mensagemSucesso = 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.';
            this.form.disable();
            this.enviando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.mensagemErro = 'Ocorreu um erro ao enviar a avaliação.';
            this.enviando = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.enviando = false;
        this.cdr.detectChanges();
      }

    } catch (error) {
      this.mensagemErro = 'Ocorreu um erro de comunicação com o servidor.';
      this.enviando = false;
      this.cdr.detectChanges();
    }
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
        const respostaItemId = resposta.itemPergunta?.id
                            || resposta.item_pergunta?.id
                            || resposta.item_pergunta_id
                            || resposta.item_pergunta;

        return respostaItemId === item.id;
      }).length;

      return { texto: item.texto, quantidade: votos };
    });
  }
}
