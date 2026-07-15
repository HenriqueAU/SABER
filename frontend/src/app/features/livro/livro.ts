import { Component, inject, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LivrosService } from '../../../client/services/livros.service';
import { ExemplaresService } from '../../../client/services/exemplares.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import { TipoPerfil } from '../../core/auth/tipo-perfil.enum';
import { CreateLivroDto } from '../../../client/models/index';
import ExemplarComponent from './exemplar/exemplar';
import GenerosComponent from './generos/generos';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import Modal from 'bootstrap/js/dist/modal';
import { LivroGeneroService } from "../../../client";

interface Livro extends CreateLivroDto {
  id: string;
}

function isbnTemFormatoValido(control: AbstractControl): ValidationErrors | null {
  const valor =  control.value;
  if (!valor) return null;
  return validarIsbnFormato(valor) ? null : { isbnInvalido: true }
}

function validarIsbnFormato(valor: string): boolean {
  const isbnLimpo = valor.replace(/[-\s]/g, '');
  return isbnLimpo.length === 10 || isbnLimpo.length === 13;
}

@Component({
  selector: 'app-livro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ExemplarComponent, GenerosComponent],
  templateUrl: './livro.html',
  styleUrl: './livro.scss',
})
export default class LivroComponent implements OnInit, AfterViewInit {
  private livrosService = inject(LivrosService);
  private exemplaresService = inject(ExemplaresService);
  private authService = inject(CoreAuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private livroGeneroService = inject(LivroGeneroService);
  private route = inject(ActivatedRoute);

  livroForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    autor: ['', Validators.required],
    isbn: ['', isbnTemFormatoValido],
    editora: [''],
    ano_publicacao: [null],
    faixa_etaria: ['livre'],
    sinopse: [''],
    capa_url: ['']
  });

  @ViewChild('livroDetalhesModal')
  livroDetalhesModalRef!: ElementRef;

  @ViewChild('livroFormModal')
  livroFormModalRef!: ElementRef;

  @ViewChild('successModal')
  successModalRef!: ElementRef;

  @ViewChild('errorModal')
  errorModalRef!: ElementRef;

  livros: Livro[] = [];
  livroSelecionado: Livro | null = null;
  livroDetalhes: Livro | null = null;
  exemplares: any[] = [];
  generosPorLivro: Record<string, string[]> = {};
  buscandoIsbn = false;
  erroIsbn = '';
  mensagemSucessoModal: string = 'Operação realizada com sucesso!';
  mensagemErroModal: string = 'Ocorreu um erro na operação.';

  termoPesquisa ='';
  generoSelecionado = '';
  generosDisponiveis: string[] = [];

  paginaAtual = 1;
  itensPorPagina = 12;

  trackById(index: number, livro: Livro): string {
    return livro.id;
  }

  get isBibliotecario(): boolean {
    return this.authService.getPerfil() === TipoPerfil.BIBLIOTECARIO;
  }

  get livrosFiltrados(): Livro[] {
    return this.livros.filter((livro)=>{
      const textoOk =
        !this.termoPesquisa ||
        livro.titulo.toLowerCase().includes(this.termoPesquisa.toLowerCase()) ||
        livro.autor.toLowerCase().includes(this.termoPesquisa.toLowerCase());

      const generoDoLivro = this.generosPorLivro[livro.id] ?? [];
      const generoOk = !this.generoSelecionado || generoDoLivro.includes(this.generoSelecionado);
      return textoOk && generoOk;

    })
  }

  get totalPaginas(): number {
    return Math.ceil(this.livrosFiltrados.length / this.itensPorPagina);
  }

  get livrosPaginados(): Livro[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.livrosFiltrados.slice(inicio, fim);
  }

  get paginasExibidas(): (number | string)[] {
    const total = this.totalPaginas;
    const atual = this.paginaAtual;
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

  getExemplaresLivro(livroId: string) {
    return this.exemplares.filter(
      exemplar => exemplar.livro.id === livroId,
    );
  }

  getStatusExemplar(livroId: string) {
    const exemplares = this.getExemplaresLivro(livroId);

    const qtdeExemplares = exemplares.length;

    if (qtdeExemplares === 0) {
      return 'SEM EXEMPLARES';
    }

    const qtdeDisponiveis = exemplares.filter(
      exemplar => exemplar.status === 'disponivel'
    ).length;

    if (qtdeDisponiveis === 0) {
      return 'INDISPONÍVEL';
    }

    return `${qtdeDisponiveis}/${qtdeExemplares} DISPONÍVEIS`;
  }

  getColorStatusExemplar(livroId: string) {

    const exemplares = this.getExemplaresLivro(livroId);

    const qtdeExemplares = exemplares.length;

    if (qtdeExemplares === 0) {
      return 'bg-secondary-subtle text-secondary';
    }

    const qtdeDisponiveis = exemplares.filter(
      exemplar => exemplar.status === 'disponivel'
    ).length;

    if (qtdeDisponiveis === 0) {
      return 'bg-danger-subtle text-danger';
    }

    return 'bg-success-subtle text-success';
  }

  getClassGenero(genero: string) {
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

  mudarPagina(pagina: number | string, event?: Event) {
    if (event) event.preventDefault();
    if (typeof pagina === 'number' && pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  ngOnInit() {
    this.carregarLivros();

    this.livroForm.get('isbn')?.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      tap((isbn: string) => {
        if (!isbn || isbn.length < 10) {
          this.erroIsbn = '';
          this.buscandoIsbn = false;
        }
      }),
      filter((isbn: string) => !!isbn && isbn.length >= 10),
      switchMap((isbn: string) => {
        this.erroIsbn = '';
        if(!validarIsbnFormato(isbn)) {
          this.erroIsbn = 'Formato inválido';
          this.buscandoIsbn = false;
          return of (null)
        }
        this.buscandoIsbn = true;
        return this.livrosService.livroControllerBuscarPorIsbn(isbn).pipe(
          catchError(() => of(null))
      );
      })
      ).subscribe((dados: any) => {
        this.buscandoIsbn = false;
        if (!dados) {
          if (!this.erroIsbn) {
            this.erroIsbn = 'Não foi possível econtrar dados para esse ISBN'
          }
          return;
        }
        this.erroIsbn = '';
        if (dados.titulo) this.livroForm.patchValue({ titulo: dados.titulo }, { emitEvent: false });
        if (dados.autor) this.livroForm.patchValue({ autor: dados.autor }, { emitEvent: false });
        if (dados.capa_url) this.livroForm.patchValue({ capa_url: dados.capa_url }, { emitEvent: false });
        if (dados.editora) this.livroForm.patchValue({ editora: dados.editora }, { emitEvent: false });
        if (dados.publicado_em){
          const ano = new Date(dados.publicado_em).getFullYear();
          if (!isNaN(ano)) this.livroForm.patchValue({ ano_publicacao: ano }, { emitEvent: false });
        }
        if (dados.sinopse) this.livroForm.patchValue({ sinopse: dados.sinopse }, { emitEvent: false });
      });
    }

  ngAfterViewInit(): void {
    this.livroFormModalRef.nativeElement.addEventListener(
      'hidden.bs.modal',
      () => {
        this.livroSelecionado = null;
        this.livroForm.reset({ faixa_etaria: 'livre'});
        this.erroIsbn = '';
        this.buscandoIsbn = false;
      }
    )
  }

  carregando = false;

  carregarLivros() {
    this.carregando = true;
    this.livrosService.livroControllerFindAll().subscribe({
      next: (dados) => {
        this.livros = dados;
        this.carregarGeneros();
        this.carregarExemplares();
        this.carregando = false;
        this.cdr.detectChanges();

        const livroIdModal = this.route.snapshot.queryParamMap.get('abrirModal');
        if (livroIdModal) {
          const livroParaAbrir = this.livros.find(l => l.id === livroIdModal);
          if (livroParaAbrir) {
            setTimeout(() => {
              this.abrirLivroDetalhesModal(livroParaAbrir);
            }, 100);
          }
        }
      }
    });
  }

  carregarExemplares() {
    this.exemplaresService.exemplarControllerFindAll().subscribe({
      next: (dados) => {
        this.exemplares = dados;
        this.cdr.detectChanges();
      }
    });
  }

  carregarGeneros() {
    this.livroGeneroService.livroGeneroControllerFindAll().subscribe({
      next: (relacoes) => {
        this.generosPorLivro = {};
        const generosSet = new Set<string>();

        relacoes.forEach((relacao: any) => {
          const livroId = relacao.livro.id;
          const nomeGenero = relacao.genero.nome;

          if (!this.generosPorLivro[livroId]) {
            this.generosPorLivro[livroId] = [];
          }
          this.generosPorLivro[livroId].push(nomeGenero);
          generosSet.add(nomeGenero);
        });

        this.generosDisponiveis = Array.from(generosSet).sort();
        this.cdr.detectChanges();
      },
    });
  }

  abrirLivroDetalhesModal(livro: Livro) {
    this.livroDetalhes = livro;

    this.cdr.detectChanges();

    const modal = new Modal(
      this.livroDetalhesModalRef.nativeElement
    );

    modal.show();
  }

  abrirLivroFormModal(livro?: Livro) {
    if (livro) {
      this.livroSelecionado = livro;
      this.livroForm.patchValue(livro);
    }
    else {
      this.livroSelecionado = null;
      this.livroForm.reset({ faixa_etaria: 'livre' });
    }

    const modal = new Modal(
      this.livroFormModalRef.nativeElement
    );

    modal.show();
  }

  private abrirModalSucesso() {
    const successModalElement = this.successModalRef.nativeElement;

    if (!successModalElement) {
      return;
    }

    const modal = new Modal(successModalElement);
    modal.show();
  }

  private abrirModalErro() {
    const errorModalElement = this.errorModalRef.nativeElement;

    if (!errorModalElement) {
      return;
    }

    const modal = new Modal(errorModalElement);
    modal.show();
  }

  onLivroSalvo() {
    if (this.livroForm.invalid) return;
    const instituicao_id = this.authService.getInstituicao();
    const formValue = { ...this.livroForm.value, instituicao_id };

    if (this.livroSelecionado) {
      this.livrosService.livroControllerUpdate(this.livroSelecionado.id, formValue).subscribe({
        next: () => {
          const livroFormModal =
            Modal.getInstance(
              this.livroFormModalRef.nativeElement
            );

          const tituloLivro = this.livroForm.get('titulo')?.value;

          livroFormModal?.hide();

          this.mensagemSucessoModal = `Livro "${tituloLivro}" editado com sucesso!`;
          this.abrirModalSucesso();

          this.carregarLivros();
          this.cdr.detectChanges();
        },
        error: () => {
          const livroFormModal =
            Modal.getInstance(
              this.livroFormModalRef.nativeElement
            );

          const tituloLivro = this.livroForm.get('titulo')?.value;

          livroFormModal?.hide();

          this.mensagemErroModal = `Erro ao editar o livro "${tituloLivro}".`;
          this.abrirModalErro();
          this.cdr.detectChanges();
        },
      });
    } else {
      this.livrosService.livroControllerCreate(formValue).subscribe({
        next: () => {
          const livroFormModal =
            Modal.getInstance(
              this.livroFormModalRef.nativeElement
            );

          const tituloLivro = this.livroForm.get('titulo')?.value;

          livroFormModal?.hide();

          this.mensagemSucessoModal = `Livro "${tituloLivro}" cadastrado com sucesso!`;
          this.abrirModalSucesso();

          this.carregarLivros();
          this.cdr.detectChanges();
        },
        error: () => {
          const livroFormModal =
            Modal.getInstance(
              this.livroFormModalRef.nativeElement
            );

          const tituloLivro = this.livroForm.get('titulo')?.value;

          livroFormModal?.hide();

          this.mensagemErroModal = `Erro ao cadastrar o livro "${tituloLivro}".`;
          this.abrirModalErro();
          this.cdr.detectChanges();
        },
      });
    }
  }
}
