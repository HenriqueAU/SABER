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
type PeriodoRanking = '7d' | '15d' | '30d' | 'todos';

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
  totalExemplaresAnimado = signal<number>(0);
  generos = signal<any[]>([]);
  mediaLeitura = signal<any | null>(null);
  mensagemErro = signal<string>('');

  faixaSelecionada = signal<FaixaEtaria>('todas');
  periodosRanking: { label: string; value: PeriodoRanking }[] = [
    { label: 'Últimos 7 dias', value: '7d' },
    { label: 'Últimos 15 dias', value: '15d' },
    { label: 'Últimos 30 dias', value: '30d' },
    { label: 'Todos os tempos', value: 'todos' }
  ];
  periodoRanking = signal<PeriodoRanking>('todos');
  periodoDevolucoes = signal<PeriodoRanking>('todos');
  periodoLog = signal<PeriodoRanking>('todos');

  onPeriodoRankingChange(periodo: string): void {
    this.periodoRanking.set(periodo as PeriodoRanking);
  }

  onPeriodoDevolucoesChange(periodo: string): void {
    this.periodoDevolucoes.set(periodo as PeriodoRanking);
  }

  onPeriodoLogChange(periodo: string): void {
    this.periodoLog.set(periodo as PeriodoRanking);
    this.paginaAtual.set(1);
  }

  rankingLivros = computed(() => {
    const periodo = this.periodoRanking();
    const emprestimos = this.emprestimos();

    if (emprestimos.length === 0) return [];

    let limiteData: Date | null = null;
    const agora = new Date();

    if (periodo === '7d') {
      limiteData = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodo === '15d') {
      limiteData = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000);
    } else if (periodo === '30d') {
      limiteData = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let emprestimosFiltrados = emprestimos;
    if (limiteData) {
      emprestimosFiltrados = emprestimos.filter((e: any) => {
        if (!e.data_retirada) return false;
        const dataRetirada = new Date(e.data_retirada);
        return dataRetirada >= limiteData!;
      });
    }

    const contagem = new Map<number, any>();

    emprestimosFiltrados.forEach((e: any) => {
      const livro = e.exemplar?.livro;
      if (livro) {
        if (!contagem.has(livro.id)) {
          contagem.set(livro.id, {
            livroId: livro.id,
            titulo: livro.titulo,
            autor: livro.autor,
            capa_url: livro.capa_url,
            totalEmprestimos: 0,
          });
        }
        contagem.get(livro.id).totalEmprestimos++;
      }
    });

    return Array.from(contagem.values())
      .sort((a, b) => b.totalEmprestimos - a.totalEmprestimos)
      .slice(0, 5);
  });

  paginaAtual = signal<number>(1);
  itensPorPagina = 10;

  emprestimosFiltradosLog = computed(() => {
    const periodo = this.periodoLog();
    const emprestimos = this.emprestimos();

    if (periodo === 'todos') return emprestimos;

    let limiteData: Date | null = null;
    const agora = new Date();

    if (periodo === '7d') {
      limiteData = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodo === '15d') {
      limiteData = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000);
    } else if (periodo === '30d') {
      limiteData = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (limiteData) {
      return emprestimos.filter((e: any) => {
        if (!e.data_retirada) return false;
        const dataRetirada = new Date(e.data_retirada);
        return dataRetirada >= limiteData!;
      });
    }

    return emprestimos;
  });

  emprestimosPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.emprestimosFiltradosLog().slice(inicio, fim);
  });

  totalPaginas = computed(() => Math.ceil(this.emprestimosFiltradosLog().length / this.itensPorPagina));

  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));

  emprestimosDevolvidosFiltrados = computed(() => {
    const periodo = this.periodoDevolucoes();
    const devolvidos = this.emprestimos().filter((e: any) => e.data_devolucao_efetiva);

    let limiteData: Date | null = null;
    const agora = new Date();

    if (periodo === '7d') {
      limiteData = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodo === '15d') {
      limiteData = new Date(agora.getTime() - 15 * 24 * 60 * 60 * 1000);
    } else if (periodo === '30d') {
      limiteData = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (limiteData) {
      return devolvidos.filter((e: any) => {
        const dataDevolucao = new Date(e.data_devolucao_efetiva);
        return dataDevolucao >= limiteData!;
      });
    }

    return devolvidos;
  });

  totalDevolvidos = computed(() => this.emprestimosDevolvidosFiltrados().length);

  totalNoPrazo = computed(() =>
    this.emprestimosDevolvidosFiltrados().filter(
      (e: any) => new Date(e.data_devolucao_efetiva) <= new Date(e.data_devolucao_esperada)
    ).length
  );

  totalAtrasados = computed(
    () => (this.totalDevolvidos() - this.totalNoPrazo()),
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
      media: this.dashboardService.dashboardControllerMediaLeitura(),
      emprestimos: this.emprestimosService.emprestimoControllerFindAll(),
      exemplares: this.exemplaresService.exemplarControllerFindAll(),
    }).subscribe({
      next: ({ media, emprestimos, exemplares }) => {
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
        this.animarContadorExemplares(exemplares.length);
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

  private limitarGeneros(dados: any[]): any[] {
    if (dados.length <= 3) return dados;

    const ordenados = [...dados].sort(
      (a, b) => b.totalEmprestimos - a.totalEmprestimos
    );

    const top3 = ordenados.slice(0, 3);
    const restante = ordenados.slice(3);
    const outrosTotal = restante.reduce((sum: number, genero: any) => sum + genero.totalEmprestimos, 0);

    if (outrosTotal > 0) {
      return [...top3, { nome: 'Outros', totalEmprestimos: outrosTotal }];
    }
    return top3;
  }

  private renderGenresChart(): void {
    const canvas = document.getElementById('genresChartBibliotecario') as HTMLCanvasElement;
    if (!canvas) return;

    const dadosLimitados = this.limitarGeneros(this.generos());
    const total = dadosLimitados.reduce((sum: number, genero: any) => sum + genero.totalEmprestimos, 0);

    if (this.genresChartInstance) {
      this.genresChartInstance.destroy();
    }

    this.genresChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: dadosLimitados.map((genero) => genero.nome),
        datasets: [
          {
            data: dadosLimitados.map((genero) => genero.totalEmprestimos),
            backgroundColor: ['#00244C', '#006595', '#0ea7e0', '#a8c8fc'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || '';
                const value = ctx.parsed || 0;
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return ` ${label}: ${value} alunos (${pct}%)`;
              },
            },
          },
        },
      },
      plugins: [
        {
          id: 'centerText',
          beforeDraw: (chart) => {
            const { ctx, width, height, chartArea } = chart;
            ctx.save();
            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;

            ctx.font = 'bold 20px Lato, sans-serif';
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(String(total), centerX, centerY + 2);

            ctx.font = '16px Lato, sans-serif';
            ctx.fillStyle = '#1F2232';
            ctx.textBaseline = 'top';
            ctx.fillText('Total', centerX, centerY + 4);
            ctx.restore();
          },
        },
      ],
    });
  }

  private animarContadorExemplares(destino: number) {
    if (destino === 0 || typeof window === 'undefined') {
      this.totalExemplaresAnimado.set(destino);
      return;
    }

    const duracaoAnimacaoMs = 1500;
    const inicio = performance.now();

    const passoAnimacao = (tempoAtual: number) => {
      const progresso = Math.min((tempoAtual - inicio) / duracaoAnimacaoMs, 1);
      const curvaDesaceleracao = progresso * (2 - progresso);
      const valorAtual = Math.floor(destino * curvaDesaceleracao);

      this.totalExemplaresAnimado.set(valorAtual);

      if (progresso < 1) {
        requestAnimationFrame(passoAnimacao);
      } else {
        this.totalExemplaresAnimado.set(destino);
      }
    };

    requestAnimationFrame(passoAnimacao);
  }
}
