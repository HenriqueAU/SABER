import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../../../../client/services/dashboard.service';
import { EmprestimosService } from '../../../../../../client/services/emprestimos.service';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

type FaixaEtaria = 'todas' | 'livre' | '10+' | '12+' | '14+' | '16+' | '18+';

@Component({
  selector: 'app-home-bibliotecario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-bibliotecario.html',
})
export default class HomeBibliotecarioComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private emprestimosService = inject(EmprestimosService);

  emprestimos = signal<any[]>([]);
  emprestimosAtivos = signal<number>(0);
  rankingLivros = signal<any[]>([]);
  generos = signal<any[]>([]);
  mediaLeitura = signal<any | null>(null);
  mensagemErro = signal<string>('');

  faixaSelecionada = signal<FaixaEtaria>('todas');

  paginaAtual = signal<number>(1);
  itensPorPagina = 10;

  emprestimosPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.emprestimos().slice(inicio, fim);
  });

  totalPaginas = computed(() =>
    Math.ceil(this.emprestimos().length / this.itensPorPagina)
  );

  paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1)
  );

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaAtual.set(pagina);
  }

  faixas: { label: string; value: FaixaEtaria }[] = [
    { label: 'Todas as idades', value: 'todas' },
    { label: 'Livre', value: 'livre' },
    { label: '10+', value: '10+' },
    { label: '12+', value: '12+' },
    { label: '14+', value: '14+' },
    { label: '16+', value: '16+' },
    { label: '18+', value: '18+' },
  ];

  private genresChartInstance: Chart | null = null;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    forkJoin({
      ranking: this.dashboardService.dashboardControllerLivrosMaisEmprestados(),
      media: this.dashboardService.dashboardControllerMediaLeitura(),
      emprestimos: this.emprestimosService.emprestimoControllerFindAll(),
    }).subscribe({
      next: ({ ranking, media, emprestimos }) => {
        this.rankingLivros.set(ranking);
        this.mediaLeitura.set(media);
        this.emprestimos.set(emprestimos);

        const ativos = emprestimos.filter((e: any) => !e.data_devolucao_efetiva);
        this.emprestimosAtivos.set(ativos.length);
      },
      error: (err) => this.mensagemErro.set('Erro ao carregar dados do dashboard'),
    });

    this.carregarGeneros();
  }

  carregarGeneros(): void {
    const faixa = this.faixaSelecionada();
    const faixaParam = faixa === 'todas' ? undefined : faixa;

    this.dashboardService.dashboardControllerGenerosMaisProcurados(faixaParam).subscribe({
      next: (dados) => {
        this.generos.set(dados);
        setTimeout(() => this.renderGenresChart(), 0);
      },
      error: (err) => this.mensagemErro.set('Erro ao carregar gêneros mais procurados'),
    });
  }

  onFaixaChange(faixa: FaixaEtaria): void {
    this.faixaSelecionada.set(faixa);
    this.carregarGeneros();
  }

  get deltaPositivo(): boolean {
    return (this.mediaLeitura()?.variacaoPercent ?? 0) >= 0;
  }

  get deltaLabel(): string {
    const d = this.mediaLeitura()?.variacaoPercent ?? 0;
    const abs = Math.abs(d);
    return d >= 0
      ? `↑ ${abs}% a mais que o mês anterior`
      : `↓ ${abs}% a menos que o mês anterior`;
  }

  private renderGenresChart(): void {
    const canvas = document.getElementById('genresChartBibliotecario') as HTMLCanvasElement;
    if (!canvas) return;

    const dados = this.generos();

    if (this.genresChartInstance) {
      this.genresChartInstance.destroy();
    }

    this.genresChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: dados.map(g => g.nome),
        datasets: [{
          data: dados.map(g => g.totalEmprestimos),
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
}
