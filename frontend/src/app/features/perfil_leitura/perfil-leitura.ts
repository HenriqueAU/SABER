import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { firstValueFrom } from 'rxjs';
import { ClubesService, EmprestimosService } from '../../../client';
import { HttpClient } from '@angular/common/http';
import { BASE_PATH_DEFAULT } from '../../../client/tokens/index';

Chart.register(...registerables);

@Component({
  selector: 'app-perfil-leitura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-leitura.html',
  styleUrl: './perfil-leitura.scss'
})
export default class PerfilLeituraComponent implements OnInit {
  private emprestimosService = inject(EmprestimosService);
  private clubesService = inject(ClubesService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private basePath = inject(BASE_PATH_DEFAULT);

  carregando = signal<boolean>(true);
  erro = signal<string>('');

  leiturasPorGenero = signal<any[]>([]);
  historicoLeitura = signal<any[]>([]);
  historicoClubs = signal<any[]>([]);
  recomendacoes = signal<any[]>([]);
  paginaHistorico = signal<number>(1);
  paginaClubes = signal<number>(1);
  itensPorPagina = 4;

  historicoLeituraPaginado = computed(() => {
    const inicio = (this.paginaHistorico() - 1) * this.itensPorPagina;
    return this.historicoLeitura().slice(inicio, inicio + this.itensPorPagina);
  });

  totalPaginasHistorico = computed(() =>
    Math.ceil(this.historicoLeitura().length / this.itensPorPagina) || 1
  );

  historicoClubesPaginado = computed(() => {
    const inicio = (this.paginaClubes() - 1) * this.itensPorPagina;
    return this.historicoClubs().slice(inicio, inicio + this.itensPorPagina);
  });

  totalPaginasClubes = computed(() =>
    Math.ceil(this.historicoClubs().length / this.itensPorPagina) || 1
  );

  mudarPaginaHistorico(p: number) {
    if (p >= 1 && p <= this.totalPaginasHistorico()) this.paginaHistorico.set(p);
  }

  mudarPaginaClubes(p: number) {
    if (p >= 1 && p <= this.totalPaginasClubes()) this.paginaClubes.set(p);
  }

  paginaRecomendacoesAtual = signal<number>(1);
  larguraTela = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  getCorGenero(genero: string): string {
    switch (genero) {
      case 'Poesia': return '#7C3AED';
      case 'Romance': return '#DB2777';
      case 'Tecnologia': return '#2563EB';
      case 'Aventura': return '#14B8A6';
      case 'Ficção Científica': return '#3B82F6';
      case 'Filosofia': return '#D97706';
      case 'História': return '#B45309';
      case 'Terror': return '#4B5563';
      case 'Fantasia': return '#22C55E';
      case 'Biografias': return '#0EA5E9';
      default: return '#748397';
    }
  }

  private chartInstance: Chart | null = null;

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.larguraTela.set(window.innerWidth);
    }
  }

  itensPorPaginaRecomendacoes = computed(() => {
    const w = this.larguraTela();
    if (w < 576) return 3;
    if (w < 992) return 4;
    return 6;
  });

  paginaSegura = computed(() => {
    const max = this.totalPaginasRecomendacoes();
    const atual = this.paginaRecomendacoesAtual();
    return atual > max ? max : atual;
  });

  recomendacoesPaginadas = computed(() => {
    const itens = this.itensPorPaginaRecomendacoes();
    const inicio = (this.paginaSegura() - 1) * itens;
    return this.recomendacoes().slice(inicio, inicio + itens);
  });

  totalPaginasRecomendacoes = computed(() => {
    return Math.ceil(this.recomendacoes().length / this.itensPorPaginaRecomendacoes()) || 1;
  });

  getClassGenero(genero: string) {
    switch (genero) {
      case 'Poesia': return 'genero-poesia';
      case 'Romance': return 'genero-romance';
      case 'Tecnologia': return 'genero-tecnologia';
      case 'Aventura': return 'genero-aventura';
      case 'Ficção Científica': return 'genero-ficcao-cientifica';
      case 'Filosofia': return 'genero-filosofia';
      case 'História': return 'genero-historia';
      case 'Terror': return 'genero-terror';
      case 'Fantasia': return 'genero-fantasia';
      case 'Biografias': return 'genero-biografias';
      default: return 'bg-secondary text-white';
    }
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  abrirRecomendacao(livroId: string) {
    this.router.navigate(['/livros'], { queryParams: {abrirModal: livroId } });
  }

  mudarPaginaRecomendacoes(novaPagina: number) {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginasRecomendacoes()) {
      this.paginaRecomendacoesAtual.set(novaPagina);
    }
  }

  private async carregarDados(): Promise<void> {
    this.carregando.set(true);
    this.erro.set('');

    try {
      const resEmprestimos = await firstValueFrom(this.emprestimosService.emprestimoControllerFindAll());
      const emprestimos = Array.isArray(resEmprestimos) ? resEmprestimos : [];
      const historico = emprestimos.filter(e => e.data_devolucao_efetiva);
      this.historicoLeitura.set(historico);

      const resPerfil = await firstValueFrom(this.emprestimosService.emprestimoControllerGetLeiturasPorGenero());
      const perfil = Array.isArray(resPerfil) ? resPerfil : [];
      this.leiturasPorGenero.set(perfil);

      const resClubes = await firstValueFrom(this.clubesService.clubeControllerFindMeusClubes());
      const todosClubes = Array.isArray(resClubes) ? resClubes : [];
      const hoje = new Date();
      const encerrados = todosClubes.filter(c => !c.ativo || (c.data_fim && new Date(c.data_fim) <= hoje));
      this.historicoClubs.set(encerrados);

      const url = `${this.basePath}/livros/recomendacoes/perfil`;
      const recomendados = await firstValueFrom(this.http.get<any[]>(url));
      
      this.recomendacoes.set(recomendados);

    } catch (e) {
      this.erro.set('Não foi possível carregar os dados do perfil de leitura.');
    } finally {
      this.carregando.set(false);
      setTimeout(() => this.renderChart(), 0);
    }
  }

  private renderChart(): void {
    const perfil = this.leiturasPorGenero();
    if (!perfil || perfil.length === 0) return;

    const canvas = document.getElementById('perfilLeituraChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartInstance) this.chartInstance.destroy();

    const coresDinamicas = perfil.map(g => this.getCorGenero(g.genero));

    this.chartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: perfil.map(g => g.genero),
        datasets: [{
          data: perfil.map(g => g.quantidade),
          backgroundColor: coresDinamicas,
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, precision: 3 },
          }
        }
      },
    });
  }
}
