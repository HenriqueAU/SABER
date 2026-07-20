import { Component, OnInit, signal, inject, computed, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmprestimosService } from '../../../../../../client/services';
import { LivroGeneroService } from '../../../../../../client/services/livroGenero.service';
import { ClubesService } from '../../../../../../client/services/clubes.service';
import { PreferenciasGeneroService } from '../../../../../../client/services/preferenciasGenero.service';

@Component({
  selector: 'app-home-aluno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-aluno.html',
})
export default class HomeAlunoComponent implements OnInit {
  private emprestimosService = inject(EmprestimosService);
  private livroGeneroService = inject(LivroGeneroService);
  private clubesService = inject(ClubesService);
  private preferenciasGeneroService = inject(PreferenciasGeneroService);
  private router = inject(Router);

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
      
      // recomendações de livros
      // pontuação

      const resLivroGeneros = await firstValueFrom(this.livroGeneroService.livroGeneroControllerFindAll()); 
      const livrosGeneros = Array.isArray(resLivroGeneros) ? resLivroGeneros : [];

      const resHistoricoLeitura = await firstValueFrom(this.emprestimosService.emprestimoControllerGetLeiturasPorGenero());
      const historicoLeitura = Array.isArray(resHistoricoLeitura) ? resHistoricoLeitura : [];

      const resgenerosPreferidos = await firstValueFrom(this.preferenciasGeneroService.preferenciaGeneroControllerFindAll());
      const generosPreferidos = Array.isArray(resgenerosPreferidos) ? resgenerosPreferidos : [];

      const pontuacaoGeneros = new Map<string, number>();

      // os generos preferidos recebem 5 pontos e são armazenados em pontuacaoGeneros
      for (const item of generosPreferidos) {
        if (item.genero?.nome) {
          pontuacaoGeneros.set(item.genero.nome.trim().toLowerCase(), 10);
        }
      }

      // para cada livro no histórico, soma 1 aos generos dos livros + pontos atuais
      if (historicoLeitura.length > 0) {
        for (const livro of historicoLeitura) {
          if (livro.genero) {
            const generoLowerCase = livro.genero.trim().toLowerCase();
            const pontosAtuais = pontuacaoGeneros.get(generoLowerCase) || 0;
            pontuacaoGeneros.set(generoLowerCase, pontosAtuais + livro.quantidade);
          }
        }
      }
      
      const livrosMap = new Map<string, any>();
      const livroJaLeu = (livroId: string) => {
        const jaLeu = historico.some(h => h.exemplar?.livro?.id === livroId);
        const estaLendo = ativos.some(a => a.exemplar?.livro?.id === livroId);
        return jaLeu || estaLendo;
      };

      // converte a lista para não duplicadar os livros
      for (const item of livrosGeneros) {
        if (!item.livro || !item.genero || livroJaLeu(item.livro.id)) continue;

        const livroId = item.livro.id;
        const generoNome = item.genero.nome;
        const generoLowerCase = generoNome.trim().toLowerCase();

        if (!livrosMap.has(livroId)) {
          livrosMap.set(livroId, { ...item.livro, generos: [], pontuacao: 0 });
        }

        const livroAgrupado = livrosMap.get(livroId);
        livroAgrupado.generos.push(generoNome);

        if (pontuacaoGeneros.has(generoLowerCase)) {
          livroAgrupado.pontuacao += pontuacaoGeneros.get(generoLowerCase)!;
        }
      }

      // descarta os generos com pontuação zerada e organiza da maior para menor pontuação
      let recomendados = Array.from(livrosMap.values()).filter(l => l.pontuacao > 0);
      recomendados.sort((a, b) => b.pontuacao - a.pontuacao);

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
