import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GenerosService } from '../../../../client/services/generos.service';
import { LivroGeneroService } from './livro-genero.service';

interface Genero {
  id: string;
  nome: string;
}

@Component({
  selector: 'app-generos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generos.html',
})
export default class GenerosComponent implements OnInit, OnChanges {
  @Input() livroId!: string;

  private generosService = inject(GenerosService);
  private livroGeneroService = inject(LivroGeneroService);
  private cdr = inject(ChangeDetectorRef);

  todosGeneros: Genero[] = [];
  generosVinculados: { relacaoId: string, genero: Genero }[] = [];
  generoSelecionadoId: string = '';

  ngOnInit() {
    this.carregarDados();
  }
  ngOnChanges(changes: SimpleChanges) {
  if (changes['livroId']?.currentValue) {
    this.carregarDados();
  }
}

  carregarDados() {
  this.generosService.generoControllerFindAll().subscribe({
    next: (generos) => {
      this.todosGeneros = generos;
      this.carregarVinculos();

      this.cdr.detectChanges();
    },
  });
}

  carregarVinculos() {
    if (!this.livroId) return;

    this.livroGeneroService.listar().subscribe({
     next: (relacoes) => {
  const relacoesDesteLivro = relacoes.filter(
    r => r.livro.id === this.livroId
  );

  this.generosVinculados = relacoesDesteLivro
    .map(r => {
      const genero = this.todosGeneros.find(
        g => g.id === r.genero.id
      );

      return {
        relacaoId: r.id,
        genero: genero!
      };
    })
    .filter(item => item.genero !== undefined);

  this.cdr.detectChanges();
},
    });
  }

  vincular() {
    if (!this.generoSelecionadoId) return;

    if (this.generosVinculados.some(g => g.genero.id === this.generoSelecionadoId)) {
      return;
    }

    this.livroGeneroService.vincular(this.livroId, this.generoSelecionadoId).subscribe({
      next: () => {
        this.generoSelecionadoId = '';
        this.carregarVinculos();
      },
    });
  }

  desvincular(relacaoId: string) {
    this.livroGeneroService.desvincular(relacaoId).subscribe({
      next: () => this.carregarVinculos(),
    });
  }
}
