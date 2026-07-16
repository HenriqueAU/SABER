import { Component, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { firstValueFrom } from 'rxjs';
import { ClubesService, EmprestimosService, LivroGeneroService } from '../../../client';
import { PreferenciasGeneroService } from '../../../client/services/preferenciasGenero.service';

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
  private livroGeneroService = inject(LivroGeneroService);
  private router = inject(Router);
  private preferenciasGeneroService = inject(PreferenciasGeneroService);

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

  coresGrafico = ['#003A79', '#0EA5E9', '#EAB308', '#16A34A', '#DC2626', '#8696AC', '#F97316', '#0D9488'];

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

  graficoDoughnut = computed(() => {
    const perfil = this.leiturasPorGenero();
    if (!perfil || perfil.length === 0) return '';

    const total = perfil.reduce((acc, curr) => acc + curr.quantidade, 0);
    let gradientParts: string[] = [];
    let startAngle = 0;
    perfil.forEach((item, index) => {
      const percentage = (item.quantidade / total) * 100;
      const endAngle = startAngle + percentage;
      const color = this.coresGrafico[index % this.coresGrafico.length];
      gradientParts.push(`${color} ${startAngle}% ${endAngle}%`);
      startAngle = endAngle;
    });
    return `conic-gradient(${gradientParts.join(', ')})`;
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
      const ativos = emprestimos.filter(e => !e.data_devolucao_efetiva);
      const historico = emprestimos.filter(e => e.data_devolucao_efetiva);
      this.historicoLeitura.set(historico);

      const resPerfil = await firstValueFrom(this.emprestimosService.emprestimoControllerGetLeiturasPorGenero());
      const perfil = Array.isArray(resPerfil) ? resPerfil : [];
      this.leiturasPorGenero.set(perfil);

      setTimeout(() => this.renderChart(), 0);

      const resClubes = await firstValueFrom(this.clubesService.clubeControllerFindMeusClubes());
      const todosClubes = Array.isArray(resClubes) ? resClubes : [];
      const hoje = new Date();
      const encerrados = todosClubes.filter(c => !c.ativo || (c.data_fim && new Date(c.data_fim) <= hoje));
      this.historicoClubs.set(encerrados);

      const resPreferencias = await firstValueFrom(this.preferenciasGeneroService.preferenciaGeneroControllerFindAll());
      const preferencias = Array.isArray(resPreferencias) ? resPreferencias : [];

      const pontuacaoGeneros = new Map<string, number>();

      for (const pref of preferencias) {
        if (pref.genero?.nome) {
          pontuacaoGeneros.set(pref.genero.nome.trim().toLowerCase(), 5);
        }
      }

      if (perfil.length > 0) {
        for (const itemPerfil of perfil) {
          if (itemPerfil.genero) {
            const genLower = itemPerfil.genero.trim().toLowerCase();
            const pontosAtuais = pontuacaoGeneros.get(genLower) || 0;
            pontuacaoGeneros.set(genLower, pontosAtuais + itemPerfil.quantidade);
          }
        }
      }

      const livrosMap = new Map<string, any>();
      
      const livroIndisponivel = (livroId: string) => {
        const jaLeu = historico.some(h => h.exemplar?.livro?.id === livroId);
        const estaLendo = ativos.some(a => a.exemplar?.livro?.id === livroId);
        return jaLeu || estaLendo;
      };

      const resLivroGeneros = await firstValueFrom(this.livroGeneroService.livroGeneroControllerFindAll());
      const livroGeneros = Array.isArray(resLivroGeneros) ? resLivroGeneros : [];

      for (const lg of livroGeneros) {
        if (!lg.livro || !lg.genero || livroIndisponivel(lg.livro.id)) continue;

        const livroId = lg.livro.id;
        const generoNome = lg.genero.nome;
        const generoLower = generoNome.trim().toLowerCase();

        if (!livrosMap.has(livroId)) {
          livrosMap.set(livroId, { ...lg.livro, generos: [], pontuacao: 0 });
        }
        const livroAgrupado = livrosMap.get(livroId);
        livroAgrupado.generos.push(generoNome);
        if (pontuacaoGeneros.has(generoLower)) {
          livroAgrupado.pontuacao += pontuacaoGeneros.get(generoLower)!;
        }
      }

      let recomendados = Array.from(livrosMap.values()).filter(l => l.pontuacao > 0);
      recomendados.sort((a, b) => b.pontuacao - a.pontuacao);
      if (recomendados.length === 0) {
        recomendados = Array.from(livrosMap.values()).slice(0, 12);
      }
      this.recomendacoes.set(recomendados);

    } catch (e) {
      this.erro.set('Não foi possível carregar os dados do perfil de leitura.');
    } finally {
      this.carregando.set(false);
    }
  }

  private renderChart(): void {
    const perfil = this.leiturasPorGenero();
    if (!perfil || perfil.length === 0) return;

    const canvas = document.getElementById('perfilLeituraChart') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartInstance) this.chartInstance.destroy();

    this.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: perfil.map(g => g.genero),
        datasets: [{
          data: perfil.map(g => g.quantidade),
          backgroundColor: this.coresGrafico,
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
