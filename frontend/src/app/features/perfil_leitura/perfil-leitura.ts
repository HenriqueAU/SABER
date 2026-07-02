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

interface DadosPerfil {
  leiturasPorGenero: { nome: string; total: number }[];
  historicoLeitura: LivroHistorico[];
}

@Component({
  selector: 'app-perfil-leitura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-leitura.html',
})
export default class PerfilLeituraComponent implements OnInit {
  dados = signal<DadosPerfil | null>(null);
  private chartInstance: Chart | null = null;

  ngOnInit(): void {
    this.dados.set(this.getMockData());
    setTimeout(() => this.renderChart(), 0);
  }

  private renderChart(): void {
    const d = this.dados();
    if (!d) return;

    const canvas = document.getElementById('perfilLeituraChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartInstance) this.chartInstance.destroy();

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: d.leiturasPorGenero.map(g => g.nome),
        datasets: [{
          data: d.leiturasPorGenero.map(g => g.total),
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

  private getMockData(): DadosPerfil {
    return {
      leiturasPorGenero: [
        { nome: 'Ficção', total: 5 },
        { nome: 'Aventura', total: 3 },
        { nome: 'História', total: 2 },
        { nome: 'Romance', total: 2 },
      ],
      historicoLeitura: [
        { id: '1', titulo: '1984',           autor: 'George Orwell',      capaUrl: null, genero: 'Ficção',   dataDevolucao: new Date('2025-06-10') },
        { id: '2', titulo: 'O Alquimista',   autor: 'Paulo Coelho',       capaUrl: null, genero: 'Romance',  dataDevolucao: new Date('2025-05-22') },
        { id: '3', titulo: 'Duna',           autor: 'Frank Herbert',      capaUrl: null, genero: 'Ficção',   dataDevolucao: new Date('2025-04-15') },
        { id: '4', titulo: 'Dom Casmurro',   autor: 'Machado de Assis',   capaUrl: null, genero: 'Romance',  dataDevolucao: new Date('2025-03-08') },
        { id: '5', titulo: 'Sapiens',        autor: 'Yuval Noah Harari',  capaUrl: null, genero: 'História', dataDevolucao: new Date('2025-02-20') },
      ],
    };
  }
}
