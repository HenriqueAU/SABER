import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Modal } from 'bootstrap';
import { EmpréstimosService } from '../../../client/services/emprestimos.service';
import { ExemplaresService } from '../../../client/services/exemplares.service';
import { CommonModule } from '@angular/common';
import { LivrosService } from '../../../client/services/livros.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-emprestimo',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './emprestimo.html',
  styleUrl: './emprestimo.css',
})
export default class EmprestimoComponent {
  emprestimoForm = new FormGroup({
    nome_aluno: new FormControl('', {
      validators: []
    }),

    data_retirada: new FormControl('', {
      validators: []
    }),

    data_devolucao_esperada: new FormControl('', {
      validators: []
    }),
  });

  livros$: Observable<any>;

  exemplares: any[] = [];

  constructor(
    protected emprestimosService: EmpréstimosService,
    protected exemplaresService: ExemplaresService,
    protected livrosService: LivrosService,
  ) {
    this.livros$ = this.livrosService.livroControllerFindAll();

    this.exemplaresService
      .exemplarControllerFindAll()
      .subscribe(data => {
        this.exemplares = data;
      });
  }

  private abrirModalSucesso() {
    const successModalElement = document.getElementById('successModal');

    if (!successModalElement) {
      return;
    }

    const modal = new Modal(successModalElement);
    modal.show();
  }

  getExemplaresLivro(livroId: string) {
    return this.exemplares.filter(
      exemplar => exemplar.livro.id === livroId,
      console.log(this.exemplares[0])
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
      return 'bg-secondary text-white';
    }

    const qtdeDisponiveis = exemplares.filter(
      exemplar => exemplar.status === 'disponivel'
    ).length;

    if (qtdeDisponiveis === 0) {
      return 'bg-danger';
    }

    return 'bg-success';
  }

  onSubmit() {


    this.abrirModalSucesso();
  }
}
