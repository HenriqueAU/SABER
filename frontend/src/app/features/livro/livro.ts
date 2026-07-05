import { Component, inject, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { LivrosService } from '../../../client/services/livros.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import { TipoPerfil } from '../../core/auth/tipo-perfil.enum';
import { CreateLivroDto } from '../../../client/models/index';
import ExemplarComponent from './exemplar/exemplar';
import GenerosComponent from './generos/generos';
import { LivroGeneroService } from './generos/livro-genero.service';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Modal } from "bootstrap";

interface Livro extends CreateLivroDto {
  id: string;
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
  private authService = inject(CoreAuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private livroGeneroService = inject(LivroGeneroService);

  livroForm: FormGroup = this.fb.group({
    titulo: ['', Validators.required],
    autor: ['', Validators.required],
    isbn: [''],
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
  generosPorLivro: Record<string, string[]> = {};
  buscandoIsbn = false;
  mensagemSucessoModal: string = 'Operação realizada com sucesso!';
  mensagemErroModal: string = 'Ocorreu um erro na operação.';

  termoPesquisa ='';
  generoSelecionado = '';
  generosDisponiveis: string[] = [];
  
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

  ngOnInit() {
    this.carregarLivros();

    this.livroForm.get('isbn')?.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      filter((isbn: string) => !!isbn && isbn.length >= 10),
      switchMap((isbn: string) => {
      this.buscandoIsbn = true;
      return this.livrosService.livroControllerBuscarPorIsbn(isbn).pipe(
        catchError(() => of(null))
    );
  })
    ).subscribe((dados: any) => {
      this.buscandoIsbn = false;
      if (!dados) return;
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
      }
    )
  }

  carregarLivros() {
    this.livrosService.livroControllerFindAll().subscribe({
      next: (dados) => {
        this.livros = dados;
        this.carregarGeneros();
      }
    });
  }

  carregarGeneros() {
    this.livroGeneroService.listar().subscribe({
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
