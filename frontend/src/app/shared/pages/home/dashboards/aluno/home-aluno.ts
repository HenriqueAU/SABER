import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BASE_PATH_DEFAULT } from '../../../../../../client/tokens';
import { EmprestimosService } from '../../../../../../client/services';
import { LivroGeneroService } from '../../../../../../client/services/livroGenero.service';

@Component({
  selector: 'app-home-aluno',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-aluno.html',
})
export default class HomeAlunoComponent implements OnInit {
  private emprestimosService = inject(EmprestimosService);
  private livroGeneroService = inject(LivroGeneroService);
  private http = inject(HttpClient);
  private basePath = inject(BASE_PATH_DEFAULT);

  carregando = signal<boolean>(true);
  erro = signal<string>('');
  totalLivrosLidos = signal<number>(0);
  totalClubes = signal<number>(0);
  emprestimosAtivos = signal<any[]>([]);
  historicoLeitura = signal<any[]>([]);
  clubesAtivos = signal<any[]>([]);
  clubesEncerrados = signal<any[]>([]);
  perfilLeitura = signal<any[]>([]);
  recomendacoes = signal<any[]>([]);

  ngOnInit(): void {
    this.carregarPainel();
  }

  estaAtrasado(data: string | Date): boolean {
    if (!data) return false;
    return new Date(data) < new Date();
  }

  calcularPorcentagem(quantidade: number): number {
    const quantidades = this.perfilLeitura().map(p => p.quantidade);
    const max = quantidades.length > 0 ? Math.max(...quantidades) : 1;
    return (quantidade / max) * 100;
  }

  private async carregarPainel() {
    this.carregando.set(true);
    this.erro.set('');

    try {
      const resEmprestimos = await firstValueFrom(this.emprestimosService.emprestimoControllerFindAll());
      const emprestimos = Array.isArray(resEmprestimos) ? resEmprestimos : [];
      
      const ativos = emprestimos.filter(e => !e.data_devolucao_efetiva);
      const historico = emprestimos.filter(e => e.data_devolucao_efetiva);
      
      this.emprestimosAtivos.set(ativos);
      this.historicoLeitura.set(historico);
      this.totalLivrosLidos.set(historico.length);

      const resClubes = await firstValueFrom(this.http.get<any[]>(`${this.basePath}/clubes/meus-clubes`));
      const todosClubes = Array.isArray(resClubes) ? resClubes : [];
      
      const hoje = new Date();
      const cAtivos = todosClubes.filter(c => c.ativo && (!c.data_fim || new Date(c.data_fim) > hoje));
      const cEncerrados = todosClubes.filter(c => !c.ativo || (c.data_fim && new Date(c.data_fim) <= hoje));

      this.clubesAtivos.set(cAtivos);
      this.clubesEncerrados.set(cEncerrados);
      this.totalClubes.set(todosClubes.length);

      const resPerfil = await firstValueFrom(this.http.get<any[]>(`${this.basePath}/emprestimos/estatisticas/generos`));
      const perfil = Array.isArray(resPerfil) ? resPerfil : [];
      this.perfilLeitura.set(perfil);

      if (perfil.length > 0) {
        const sortedPerfil = [...perfil].sort((a, b) => b.quantidade - a.quantidade);
        const topGenero = sortedPerfil[0].genero;

        const resLivroGeneros = await firstValueFrom(this.livroGeneroService.livroGeneroControllerFindAll());
        const livroGeneros = Array.isArray(resLivroGeneros) ? resLivroGeneros : [];

        const recomendadosMap = new Map();
        for (const lg of livroGeneros) {
          if (lg.genero?.nome === topGenero && lg.livro) {
            const jaLeu = historico.some(h => h.exemplar?.livro?.id === lg.livro.id);
            const estaLendo = ativos.some(a => a.exemplar?.livro?.id === lg.livro.id);
            
            if (!jaLeu && !estaLendo) {
              recomendadosMap.set(lg.livro.id, { ...lg.livro, generoNome: topGenero });
            }
          }
        }
        this.recomendacoes.set(Array.from(recomendadosMap.values()).slice(0, 3));
      }
    } catch (e) {
      this.erro.set('Não foi possível carregar os dados do painel. Verifique a sua conexão.');
    } finally {
      this.carregando.set(false);
    }
  }
}