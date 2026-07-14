import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../../../../client/services/dashboard.service';
import { EmprestimosService } from '../../../../../../client/services/emprestimos.service';
import { ExemplaresService } from '../../../../../../client/services/exemplares.service';
import { forkJoin } from 'rxjs';
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

type FaixaEtaria = 'todas' | '0-12' | '13-17' | '18-25' | '26-40' | '40+';

@Component({
  selector: 'app-home-bibliotecario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-bibliotecario.html',
})
export default class HomeBibliotecarioComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private emprestimosService = inject(EmprestimosService);
  private exemplaresService = inject(ExemplaresService);

  emprestimos = signal<any[]>([]);
  emprestimosAtivos = signal<number>(0);
  totalExemplares = signal<number>(0);
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

  totalPaginas = computed(() => Math.ceil(this.emprestimos().length / this.itensPorPagina));

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  totalDevolvidos = computed(
    () => this.emprestimos().filter((e: any) => e.data_devolucao_efetiva).length,
  );

  totalNoPrazo = computed(
    () =>
      this.emprestimos().filter(
        (e: any) =>
          e.data_devolucao_efetiva &&
          new Date(e.data_devolucao_efetiva) <= new Date(e.data_devolucao_esperada),
      ).length,
  );

  porcentagemNoPrazo = computed(() => {
    const total = this.totalDevolvidos();
    if (total === 0) return 0;
    return Math.round((this.totalNoPrazo() / total) * 100);
  });

  porcentagemAtrasados = computed(() => 100 - this.porcentagemNoPrazo());

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaAtual.set(pagina);
  }

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
    this.carregarDados();
  }

  carregarDados(): void {
    forkJoin({
      ranking: this.dashboardService.dashboardControllerLivrosMaisEmprestados(),
      media: this.dashboardService.dashboardControllerMediaLeitura(),
      emprestimos: this.emprestimosService.emprestimoControllerFindAll(),
      exemplares: this.exemplaresService.exemplarControllerFindAll(),
    }).subscribe({
      next: ({ ranking, media, emprestimos, exemplares }) => {
        this.rankingLivros.set(ranking);
        this.mediaLeitura.set(media);

        const ordenados = [...emprestimos].sort((a, b) => {
          const dataA = new Date(a.data_retirada).getTime();
          const dataB = new Date(b.data_retirada).getTime();
          return dataB - dataA;
        });
        this.emprestimos.set(ordenados);

        const ativos = emprestimos.filter((e: any) => !e.data_devolucao_efetiva);
        this.emprestimosAtivos.set(ativos.length);

        this.totalExemplares.set(exemplares.length);
      },
      error: () => this.mensagemErro.set('Erro ao carregar dados do dashboard'),
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
      error: () => this.mensagemErro.set('Erro ao carregar gêneros mais procurados'),
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
    return d >= 0 ? `↑ ${abs}% a mais que o mês anterior` : `↓ ${abs}% a menos que o mês anterior`;
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
        labels: dados.map((g) => g.nome),
        datasets: [
          {
            data: dados.map((g) => g.totalEmprestimos),
            backgroundColor: ['--var()', '#003A79', '#0EA5E9', '#EAB308', '#16A34A', '#DC2626', '#8696AC', '#F97316', '#0D9488'],
            borderWidth: 0,
          },
        ],
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
