import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmprestimosService } from '../../../../../../client/services';

interface EmprestimoAtivo {
  id: string;
  titulo: string;
  capaUrl: string | null;
  dataDevolucaoEsperada: Date;
}

interface ClubeParticipando {
  id: string;
  nomeLivro: string;
  capaUrl: string | null;
  dataEncerramento: Date;
  status: 'ativo' | 'encerrado';
}

interface LivroRecomendado {
  id: string;
  titulo: string;
  autor: string;
  capaUrl: string | null;
  genero: string;
}

@Component({
  selector: 'app-home-aluno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-aluno.html',
})
export default class HomeAlunoComponent implements OnInit {
  private emprestimosService = inject(EmprestimosService);

  totalLivrosLidos = signal<number>(0);
  totalClubes = signal<number>(0);
  emprestimosAtivos = signal<EmprestimoAtivo[]>([]);
  clubes = signal<ClubeParticipando[]>([]);
  recomendacoes = signal<LivroRecomendado[]>([]);
  carregandoEmprestimos = signal(true);

  ngOnInit(): void {
    this.carregarEmprestimos();
    this.clubes.set(this.getMockClubes());
    this.recomendacoes.set(this.getMockRecomendacoes());
    this.totalClubes.set(this.getMockClubes().length);
  }

  estaAtrasado(data: Date): boolean {
    return new Date(data) < new Date();
  }

  private carregarEmprestimos(): void {
    this.emprestimosService.emprestimoControllerFindAll().subscribe({
      next: (dados: any[]) => {
        const todos = Array.isArray(dados) ? dados : [];

        this.totalLivrosLidos.set(
          todos.filter(e => e.data_devolucao_efetiva).length
        );

        this.emprestimosAtivos.set(
          todos
            .filter(e => !e.data_devolucao_efetiva)
            .map(e => ({
              id: e.id,
              titulo: e.exemplar?.livro?.titulo ?? 'Título desconhecido',
              capaUrl: e.exemplar?.livro?.capa_url ?? null,
              dataDevolucaoEsperada: new Date(e.data_devolucao_esperada),
            }))
        );

        this.carregandoEmprestimos.set(false);
      },
      error: () => {
        this.carregandoEmprestimos.set(false);
      },
    });
  }

  private getMockClubes(): ClubeParticipando[] {
    return [
      {
        id: '1',
        nomeLivro: 'Duna',
        capaUrl: null,
        dataEncerramento: new Date('2025-08-15'),
        status: 'ativo',
      },
      {
        id: '2',
        nomeLivro: 'O Senhor dos Anéis',
        capaUrl: null,
        dataEncerramento: new Date('2025-09-01'),
        status: 'ativo',
      },
    ];
  }

  private getMockRecomendacoes(): LivroRecomendado[] {
    return [
      { id: '1', titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley',   capaUrl: null, genero: 'Ficção' },
      { id: '2', titulo: 'Fundação',             autor: 'Isaac Asimov',    capaUrl: null, genero: 'Ficção' },
      { id: '3', titulo: 'Fahrenheit 451',       autor: 'Ray Bradbury',    capaUrl: null, genero: 'Ficção' },
    ];
  }
}
