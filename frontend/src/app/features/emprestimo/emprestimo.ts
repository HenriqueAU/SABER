import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { EmprestimosService } from '../../../client/services/emprestimos.service';
import { ExemplaresService } from '../../../client/services/exemplares.service';
import { CommonModule } from '@angular/common';
import { LivrosService } from '../../../client/services/livros.service';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../../client/services/usuarios.service';

@Component({
  selector: 'app-emprestimo',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './emprestimo.html',
  styleUrl: './emprestimo.css',
})
export default class EmprestimoComponent implements OnInit {
  protected emprestimosService = inject(EmprestimosService);
  protected livrosService = inject(LivrosService);
  protected exemplaresService = inject(ExemplaresService);
  protected usuariosService = inject(UsuariosService);

  emprestimoForm = new FormGroup({

    nome_aluno: new FormControl('', {
      validators: []
    }),

    aluno_id: new FormControl('', {
      validators: []
    }),

    data_devolucao_esperada: new FormControl(
      this.getDataPadraoDevolucao(), {
      validators: []
    }),
  });

  @ViewChild('emprestimoModal')
  emprestimoModalRef!: ElementRef;

  @ViewChild('exemplaresModal')
  exemplaresModalRef!: ElementRef;

  @ViewChild('successModal')
  successModalRef!: ElementRef;

  @ViewChild('errorModal')
  errorModalRef!: ElementRef;

  livros$ = this.livrosService.livroControllerFindAll();
  livroSelecionado: any = null;

  exemplares: any[] = [];
  exemplarSelecionado: any = null;

  alunos: any[] = [];
  alunosFiltrados: any[] = [];
  alunoSelecionado: any = null;

  termoPesquisa = '';

  ngOnInit(): void {
    this.exemplaresService
      .exemplarControllerFindAll()
      .subscribe(data => {
        this.exemplares = data;
      });

    this.usuariosService
      .usuarioControllerFindAll()
      .subscribe(data => {
        this.alunos = data.filter(
          (usuario: any) => usuario.perfil === 'aluno'
        );
      });
  }

  abrirModalExemplares(livro: any) {
    this.livroSelecionado = livro;

    const modal = new Modal(
      this.exemplaresModalRef.nativeElement
    );

    modal.show();
  }

  selecionarExemplar(exemplar: any) {
    this.exemplarSelecionado = exemplar;

    const exemplaresModal =
      Modal.getInstance(
        this.exemplaresModalRef.nativeElement
      );

    exemplaresModal?.hide();

    const emprestimoModal = new Modal(
      this.emprestimoModalRef.nativeElement
    );

    emprestimoModal.show();
  }

  selecionarAluno(aluno: any) {
    this.alunoSelecionado = aluno;

    this.emprestimoForm.patchValue({
      aluno_id: aluno.id
    });

    this.alunosFiltrados = [];
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

  filtrarLivros(livros: any[]) {

    if (!this.termoPesquisa.trim()) {
      return livros;
    }

    const termo = this.termoPesquisa.toLowerCase();

    return livros.filter((livro: any) =>
      livro.titulo.toLowerCase().includes(termo)
      ||
      livro.autor.toLowerCase().includes(termo)
    );

  }

  filtrarAlunos() {
    const termo =
      this.emprestimoForm.get('nome_aluno')?.value
        ?.toLowerCase() || '';

    if (!termo) {
      this.alunosFiltrados = [];
      return;
    }

    this.alunosFiltrados =
      this.alunos.filter((aluno: any) =>
        aluno.nome.toLowerCase().includes(termo)
      );
  }

  getDataPadraoDevolucao(): string {
    const data = new Date();
    data.setDate(data.getDate() + 14);
    return data.toISOString().split('T')[0];
  }

  getExemplaresLivro(livroId: string) {
    return this.exemplares.filter(
      exemplar => exemplar.livro.id === livroId,
    );
  }

  getQtdeDisponiveis(livroId: string) {
    return this.getExemplaresLivro(livroId)
      .filter(exemplar => exemplar.status === 'disponivel')
      .length;
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

  onSubmit() {

    if (!this.exemplarSelecionado) {
      return;
    }

    const payload = {
      exemplar_id: this.exemplarSelecionado.id,
      usuario_id: this.emprestimoForm.value.aluno_id,
      data_retirada: new Date(),
      data_devolucao_esperada:
        this.emprestimoForm.value.data_devolucao_esperada
    };

    this.emprestimosService
      .emprestimoControllerCreate(payload as any)
      .subscribe({
        next: () => {
          const emprestimoModal =
            Modal.getInstance(
              this.emprestimoModalRef.nativeElement
            );

          emprestimoModal?.hide();

          this.abrirModalSucesso();
        },
        error: err => {
          const emprestimoModal =
            Modal.getInstance(
              this.emprestimoModalRef.nativeElement
            );

          emprestimoModal?.hide();

          this.abrirModalErro();
        }

      });

  }
}
