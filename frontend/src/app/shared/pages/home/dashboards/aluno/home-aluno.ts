import { Component, OnInit, signal, inject, computed, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EmprestimosService } from '../../../../../../client/services';
import { LivroGeneroService } from '../../../../../../client/services/livroGenero.service';
import { ClubesService } from '../../../../../../client/services/clubes.service';

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

      const recomendadosMap = new Map<string, any>();
      const livroIndisponivel = (livroId: string) => {
        const jaLeu = historico.some(h => h.exemplar?.livro?.id === livroId);
        const estaLendo = ativos.some(a => a.exemplar?.livro?.id === livroId);
        return jaLeu || estaLendo;
      };

      if (perfil.length > 0) {
        const sortedPerfil = [...perfil].sort((a, b) => b.quantidade - a.quantidade);
        
        for (const itemPerfil of sortedPerfil) {
          const generoAtual = itemPerfil.genero?.trim().toLowerCase();
          if (!generoAtual) continue;

          for (const lg of livroGeneros) {
            const generoLivro = lg.genero?.nome?.trim().toLowerCase();
            
            if (generoLivro === generoAtual && lg.livro) {
              if (!livroIndisponivel(lg.livro.id) && !recomendadosMap.has(lg.livro.id)) {
                recomendadosMap.set(lg.livro.id, { ...lg.livro, generoNome: lg.genero.nome });
              }
            }
          }
        }
      }
      if (recomendadosMap.size === 0) {
        for (const lg of livroGeneros) {
          if (lg.livro && !livroIndisponivel(lg.livro.id) && !recomendadosMap.has(lg.livro.id)) {
            recomendadosMap.set(lg.livro.id, { ...lg.livro, generoNome: lg.genero?.nome || 'Destaque' });
          }
        }
      }

      this.recomendacoes.set(Array.from(recomendadosMap.values()));

    } catch (e) {
      this.erro.set('Não foi possível carregar os dados do painel. Verifique a sua conexão.');
    } finally {
      this.carregando.set(false);
    }
  }
}