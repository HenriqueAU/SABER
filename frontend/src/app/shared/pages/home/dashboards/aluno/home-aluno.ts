import { Component, OnInit, signal, inject, computed, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClubesService, EmprestimosService, LivrosService } from '../../../../../../client';

@Component({
  selector: 'app-home-aluno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-aluno.html',
})
export default class HomeAlunoComponent implements OnInit {
  private router = inject(Router);
  private clubesService = inject(ClubesService);
  private emprestimosService = inject(EmprestimosService);
  private livrosService = inject(LivrosService);

  carregando = signal<boolean>(true);
  erro = signal<string>('');

  totalLivrosLidos = signal<number>(0);
  totalClubes = signal<number>(0);
  totalPaginasLidas = signal<number>(0);
  paginasLidasAnimado = signal<number>(0);

  emprestimosAtivos = signal<any[]>([]);
  clubesAtivos = signal<any[]>([]);
  recomendacoes = signal<any[]>([]);

  paginaRecomendacoesAtual = signal<number>(1);
  larguraTela = signal<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  @HostListener('window:resize')

  onResize() {
    if (typeof window !== 'undefined') {
      this.larguraTela.set(window.innerWidth);
    }
  }

  itensPorPaginaRecomendacoes = computed(() => {
    return this.larguraTela() < 576 ? 3 : 4;
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

  ngOnInit(): void {
    this.carregarPainel();
  }

  getStatusPrazo(dataLimite: string | Date): 'no-prazo' | 'proximo' | 'atrasado' {
    if (!dataLimite) return 'no-prazo';

    const limite = new Date(dataLimite).setHours(0, 0, 0, 0);
    const hoje = new Date().setHours(0, 0, 0, 0);

    const diffMs = limite - hoje;
    const diasRestantes = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return 'atrasado';
    } else if (diasRestantes <= 2) {
      return 'proximo';
    } else {
      return 'no-prazo';
    }
  }

  abrirRecomendacao(livroId: string) {
    this.router.navigate(['/livros'], { queryParams: { abrirModal: livroId } });
  }

  mudarPaginaRecomendacoes(novaPagina: number) {
    if (novaPagina >= 1 && novaPagina <= this.totalPaginasRecomendacoes()) {
      this.paginaRecomendacoesAtual.set(novaPagina);
    }
  }

  getClassGenero(genero: string) {
    switch (genero) {
      case 'Poesia':
        return 'genero-poesia';

      case 'Romance':
        return 'genero-romance';

      case 'Tecnologia':
        return 'genero-tecnologia';

      case 'Aventura':
        return 'genero-aventura';

      case 'Ficção Científica':
        return 'genero-ficcao-cientifica';

      case 'Filosofia':
        return 'genero-filosofia';

      case 'História':
        return 'genero-historia';

      case 'Terror':
        return 'genero-terror';

      case 'Fantasia':
        return 'genero-fantasia';

      case 'Biografias':
        return 'genero-biografias';

      default:
        return 'bg-secondary text-white';
    }
  }

  private async carregarPainel() {
    this.carregando.set(true);
    this.erro.set('');

    try {
      const resEmprestimos = await firstValueFrom(this.emprestimosService.emprestimoControllerFindAll());
      const emprestimos = Array.isArray(resEmprestimos) ? resEmprestimos : [];

      const ativos = emprestimos.filter((e) => !e.data_devolucao_efetiva);
      const historico = emprestimos.filter((e) => e.data_devolucao_efetiva);

      this.emprestimosAtivos.set(ativos);
      this.totalLivrosLidos.set(historico.length);

      const paginasLidas = historico.reduce((acc, emp) => {
        return acc + (emp.exemplar?.livro?.paginas || 0);
      }, 0);
      this.totalPaginasLidas.set(paginasLidas);
      this.animarContadorPaginas(paginasLidas);

      const resClubes = await firstValueFrom(this.clubesService.clubeControllerFindMeusClubes());
      const todosClubes = Array.isArray(resClubes) ? resClubes : [];

      const hoje = new Date();
      const cAtivos = todosClubes.filter((c) => c.ativo && (!c.data_fim || new Date(c.data_fim) > hoje));

      this.clubesAtivos.set(cAtivos);
      this.totalClubes.set(todosClubes.length);

      const recomendados = await firstValueFrom(this.livrosService.livroControllerObterRecomendacoes());
      
      this.recomendacoes.set(recomendados);

    } catch (e) {
      this.erro.set('Não foi possível carregar os dados do painel. Verifique a sua conexão.');
    } finally {
      this.carregando.set(false);
    }
  }

  private animarContadorPaginas(destino: number) {
    if (destino === 0 || typeof window === 'undefined') {
      this.paginasLidasAnimado.set(destino);
      return;
    }

    const duracaoAnimacaoMs = 1500;
    const inicio = performance.now();
    const passoAnimacao = (tempoAtual: number) => {
      const progresso = Math.min((tempoAtual - inicio) / duracaoAnimacaoMs, 1);
      const curvaDesaceleracao = progresso * (2 - progresso);
      const valorAtual = Math.floor(destino * curvaDesaceleracao);

      this.paginasLidasAnimado.set(valorAtual);

      if (progresso < 1) {
        requestAnimationFrame(passoAnimacao);
      } else {
        this.paginasLidasAnimado.set(destino);
      }
    };

    requestAnimationFrame(passoAnimacao);
  }
}
