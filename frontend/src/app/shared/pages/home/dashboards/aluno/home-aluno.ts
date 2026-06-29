import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface LivroHistorico {
  id: string;
  titulo: string;
  autor: string;
  capaUrl: string | null;
  genero: string;
  dataDevolucao: Date;
}

interface LivroRecomendado {
  id: string;
  titulo: string;
  autor: string;
  capaUrl: string | null;
  genero: string;
}

interface DashboardAluno {
  totalLivrosLidos: number;
  generoFavorito: string;
  totalClubesParticipados: number;
  leiturasPorGenero: { nome: string; total: number }[];
  historicoLeitura: LivroHistorico[];
  recomendacoes: LivroRecomendado[];
}

@Component({
  selector: 'app-home-aluno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-aluno.html',
})
export default class HomeAlunoComponent implements OnInit {
  dashboard = signal<DashboardAluno | null>(null);
  private generoChartInstance: Chart | null = null;

  ngOnInit(): void {
    this.dashboard.set(this.getMockData());
    setTimeout(() => {
      this.renderGeneroChart();
    }, 0);
  }

  private renderGeneroChart(): void {
    const dados = this.dashboard();
    if (!dados) return;

    const canvas = document.getElementById('generoAlunoChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.generoChartInstance) {
      this.generoChartInstance.destroy();
    }

    this.generoChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: dados.leiturasPorGenero.map(g => g.nome),
        datasets: [{
          data: dados.leiturasPorGenero.map(g => g.total),
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

  private getMockData(): DashboardAluno {
    return {
      totalLivrosLidos: 12,
      generoFavorito: 'Ficção Científica',
      totalClubesParticipados: 3,
      leiturasPorGenero: [
        { nome: 'Ficção', total: 5 },
        { nome: 'Aventura', total: 3 },
        { nome: 'História', total: 2 },
        { nome: 'Romance', total: 2 },
      ],
      historicoLeitura: [
        { id: '1', titulo: '1984', autor: 'George Orwell', capaUrl: null, genero: 'Ficção', dataDevolucao: new Date('2025-06-10') },
        { id: '2', titulo: 'O Alquimista', autor: 'Paulo Coelho', capaUrl: null, genero: 'Romance', dataDevolucao: new Date('2025-05-22') },
        { id: '3', titulo: 'Duna', autor: 'Frank Herbert', capaUrl: null, genero: 'Ficção', dataDevolucao: new Date('2025-04-15') },
        { id: '4', titulo: 'Dom Casmurro', autor: 'Machado de Assis', capaUrl: null, genero: 'Romance', dataDevolucao: new Date('2025-03-08') },
        { id: '5', titulo: 'Sapiens', autor: 'Yuval Noah Harari', capaUrl: null, genero: 'História', dataDevolucao: new Date('2025-02-20') },
      ],
      recomendacoes: [
        { id: '1', titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley', capaUrl: null, genero: 'Ficção' },
        { id: '2', titulo: 'Fundação', autor: 'Isaac Asimov', capaUrl: null, genero: 'Ficção' },
        { id: '3', titulo: 'Fahrenheit 451', autor: 'Ray Bradbury', capaUrl: null, genero: 'Ficção' },
      ],
    };
  }
}
