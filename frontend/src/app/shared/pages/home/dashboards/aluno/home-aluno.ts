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

  estaAtrasado(data: string | Date): boolean {
    if (!data) return false;
    return new Date(data) < new Date();
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

      const resClubes = await firstValueFrom(this.clubesService.clubeControllerFindMeusClubes());
      const todosClubes = Array.isArray(resClubes) ? resClubes : [];

      const hoje = new Date();
      const cAtivos = todosClubes.filter((c) => c.ativo && (!c.data_fim || new Date(c.data_fim) > hoje));

      this.clubesAtivos.set(cAtivos);
      this.totalClubes.set(todosClubes.length);

      const resLivroGeneros = await firstValueFrom(this.livroGeneroService.livroGeneroControllerFindAll());
      const livroGeneros = Array.isArray(resLivroGeneros) ? resLivroGeneros : [];
      
      const resPerfil = await firstValueFrom(this.emprestimosService.emprestimoControllerGetLeiturasPorGenero());
      const perfil = Array.isArray(resPerfil) ? resPerfil : [];

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
      this.erro.set('Não foi possível carregar os dados do painel. Verifique a sua conexão.');
    } finally {
      this.carregando.set(false);
    }
  }
}