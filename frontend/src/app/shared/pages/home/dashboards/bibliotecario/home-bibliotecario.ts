import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface DashboardBibliotecario {
  emprestimosAtivos: number;
  exemplaresDisponiveis: number;
  mediaLeituraDelta: number;
  rankingLivros: { titulo: string; autor: string; total: number }[];
  logEmprestimos: { id: string; nomeUsuario: string; nomeLivro: string; dataHora: Date; status: 'ativo' | 'devolvido' | 'atrasado' }[];
}

type FaixaEtaria = 'todas' | '0-12' | '13-17' | '18-25' | '26-40' | '40+';

@Component({
  selector: 'app-home-bibliotecario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-bibliotecario.html',
})
export default class HomeBibliotecarioComponent implements OnInit {
  dashboard = signal<DashboardBibliotecario | null>(null);
  faixaSelecionada = signal<FaixaEtaria>('todas');

  faixas: { label: string; value: FaixaEtaria }[] = [
    { label: 'Todas as idades', value: 'todas' },
    { label: '0–12 anos', value: '0-12' },
    { label: '13–17 anos', value: '13-17' },
    { label: '18–25 anos', value: '18-25' },
    { label: '26–40 anos', value: '26-40' },
    { label: '40+ anos', value: '40+' },
  ];

  private genresChartInstance: Chart | null = null;

  ngOnInit(): void {
    this.dashboard.set(this.getMockData());
    setTimeout(() => {
      this.renderGenresChart();
    }, 0);
  }

  onFaixaChange(faixa: FaixaEtaria): void {
    this.faixaSelecionada.set(faixa);
    this.renderGenresChart();
  }

  get deltaPositivo(): boolean {
    return (this.dashboard()?.mediaLeituraDelta ?? 0) >= 0;
  }

  get deltaLabel(): string {
    const d = this.dashboard()?.mediaLeituraDelta ?? 0;
    const abs = Math.abs(d);
    return d >= 0
      ? `↑ ${abs}% a mais que o mês anterior`
      : `↓ ${abs}% a menos que o mês anterior`;
  }

  private renderGenresChart(): void {
    const canvas = document.getElementById('genresChartBibliotecario') as HTMLCanvasElement;
    if (!canvas) return;

    const dadosPorFaixa: Record<FaixaEtaria, { nome: string; total: number }[]> = {
      'todas':  [{ nome: 'Ficção', total: 42 }, { nome: 'Aventura', total: 35 }, { nome: 'História', total: 28 }, { nome: 'Ciências', total: 20 }, { nome: 'Romance', total: 15 }],
      '0-12':   [{ nome: 'Aventura', total: 50 }, { nome: 'Fantasia', total: 40 }, { nome: 'Fábulas', total: 30 }],
      '13-17':  [{ nome: 'Ficção', total: 38 }, { nome: 'Aventura', total: 30 }, { nome: 'Romance', total: 22 }],
      '18-25':  [{ nome: 'Ficção', total: 45 }, { nome: 'Tecnologia', total: 30 }, { nome: 'História', total: 25 }],
      '26-40':  [{ nome: 'Negócios', total: 35 }, { nome: 'Ficção', total: 28 }, { nome: 'Autoajuda', total: 20 }],
      '40+':    [{ nome: 'História', total: 40 }, { nome: 'Biografias', total: 32 }, { nome: 'Ficção', total: 18 }],
    };

    const generos = dadosPorFaixa[this.faixaSelecionada()];

    if (this.genresChartInstance) {
      this.genresChartInstance.destroy();
    }

    this.genresChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: generos.map(g => g.nome),
        datasets: [{
          data: generos.map(g => g.total),
          backgroundColor: ['#4f46e5', '#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
        },
      },
    });
  }

  private getMockData(): DashboardBibliotecario {
    return {
      emprestimosAtivos: 37,
      exemplaresDisponiveis: 124,
      mediaLeituraDelta: -2,
      rankingLivros: [
        { titulo: 'O Senhor dos Anéis', autor: 'J.R.R. Tolkien', total: 18 },
        { titulo: 'Dom Casmurro', autor: 'Machado de Assis', total: 14 },
        { titulo: '1984', autor: 'George Orwell', total: 12 },
        { titulo: 'Harry Potter', autor: 'J.K. Rowling', total: 10 },
        { titulo: 'O Alquimista', autor: 'Paulo Coelho', total: 9 },
      ],
      logEmprestimos: [
        { id: '1', nomeUsuario: 'Ana Souza',    nomeLivro: 'O Senhor dos Anéis', dataHora: new Date('2025-06-28T09:15:00'), status: 'ativo' },
        { id: '2', nomeUsuario: 'Carlos Lima',  nomeLivro: '1984',               dataHora: new Date('2025-06-27T14:30:00'), status: 'devolvido' },
        { id: '3', nomeUsuario: 'Beatriz Melo', nomeLivro: 'Dom Casmurro',       dataHora: new Date('2025-06-25T10:00:00'), status: 'atrasado' },
        { id: '4', nomeUsuario: 'Pedro Alves',  nomeLivro: 'O Alquimista',       dataHora: new Date('2025-06-24T16:45:00'), status: 'ativo' },
        { id: '5', nomeUsuario: 'Mariana Cruz', nomeLivro: 'Harry Potter',       dataHora: new Date('2025-06-23T11:20:00'), status: 'devolvido' },
      ],
    };
  }
}
