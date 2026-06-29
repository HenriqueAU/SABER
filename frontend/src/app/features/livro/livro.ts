import { Component, inject, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LivrosService } from '../../../client/services/livros.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import { TipoPerfil } from '../../core/auth/tipo-perfil.enum';
import { CreateLivroDto } from '../../../client/models/index';
import ExemplarComponent from './exemplar/exemplar';
import GenerosComponent from './generos/generos';
import { LivroGeneroService } from './generos/livro-genero.service';

interface Livro extends CreateLivroDto {
  id: string;
}
@Component({
  selector: 'app-livro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ExemplarComponent, GenerosComponent],
  templateUrl: './livro.html',
  styleUrl: './livro.scss',
})
export default class LivroComponent implements OnInit {
  private livrosService = inject(LivrosService);
  private authService = inject(CoreAuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private livroGeneroService = inject(LivroGeneroService);

  livros: Livro[] = [];
  mostrarForm = false;
  livroSelecionado: Livro | null = null;
  livroDetalhes: Livro | null = null;
  generosPorLivro: Record<string, string[]> = {};
  
  trackById(index: number, livro: Livro): string {
    return livro.id;
  }

  get isBibliotecario(): boolean {
    return this.authService.getPerfil() === TipoPerfil.BIBLIOTECARIO;
  }

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

  ngOnInit() {
    this.carregarLivros();
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
      relacoes.forEach((relacao: any) => {
        const livroId = relacao.livro.id;
        const nomeGenero = relacao.genero.nome;
        if (!this.generosPorLivro[livroId]) {
          this.generosPorLivro[livroId] = [];
        }
        this.generosPorLivro[livroId].push(nomeGenero);
      });
      this.cdr.detectChanges(); 
    },
  });
}
  abrirFormCadastro() {
    this.livroSelecionado = null;
    this.livroForm.reset({ faixa_etaria: 'livre' });
    this.mostrarForm = true;
  }

  abrirFormEdicao(livro: Livro) {
    this.livroSelecionado = livro;
    this.livroForm.patchValue(livro);
    this.mostrarForm = true;
  }

  fecharForm() {
    this.mostrarForm = false;
    this.livroSelecionado = null;
  }

  abrirDetalhes(livro: Livro) {

  this.livroDetalhes = livro;
}
  fecharDetalhes() {
    this.livroDetalhes = null;
  }

  onLivroSalvo() {
    if (this.livroForm.invalid) return;
    const instituicao_id = this.authService.getInstituicao();
    const formValue = { ...this.livroForm.value, instituicao_id };

    if (this.livroSelecionado) {
      this.livrosService.livroControllerUpdate(this.livroSelecionado.id, formValue).subscribe({
        next: () => {
          this.fecharForm();
          this.carregarLivros();
        },
      });
    } else {
      this.livrosService.livroControllerCreate(formValue).subscribe({
        next: () => {
          this.fecharForm();
          this.carregarLivros();
        },
      });
    }
  }
}


