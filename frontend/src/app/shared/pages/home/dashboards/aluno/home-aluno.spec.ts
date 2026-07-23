import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HomeAlunoComponent from './home-aluno';
import { ClubesService, EmprestimosService, LivrosService } from '../../../../../../client';
import { Router } from '@angular/router';

describe('HomeAlunoComponent', () => {
  let component: HomeAlunoComponent;
  let emprestimosServiceMock: { emprestimoControllerFindAll: ReturnType<typeof vi.fn> };
  let clubesServiceMock: { clubeControllerFindMeusClubes: ReturnType<typeof vi.fn> };
  let livrosServiceMock: { livroControllerObterRecomendacoes: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    emprestimosServiceMock = { emprestimoControllerFindAll: vi.fn() };
    clubesServiceMock = { clubeControllerFindMeusClubes: vi.fn() };
    livrosServiceMock = { livroControllerObterRecomendacoes: vi.fn() };

    TestBed.configureTestingModule({
      imports: [HomeAlunoComponent],
      providers: [
        { provide: EmprestimosService, useValue: emprestimosServiceMock },
        { provide: ClubesService, useValue: clubesServiceMock },
        { provide: LivrosService, useValue: livrosServiceMock },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ],
    });

    const fixture = TestBed.createComponent(HomeAlunoComponent);
    component = fixture.componentInstance;
  });

  describe('paginação de recomendações', () => {
    beforeEach(() => {
      const recomendacoesFalsas = Array.from({ length: 10 }, (_, i) => ({ id: `livro-${i}` }));
      (component as any).recomendacoes.set(recomendacoesFalsas);
    });

    it('usa 3 itens por página em telas menores que 576px', () => {
      component.larguraTela.set(400);
      expect(component.itensPorPaginaRecomendacoes()).toBe(3);
    });

    it('usa 4 itens por página em telas de 576px ou mais', () => {
      component.larguraTela.set(1200);
      expect(component.itensPorPaginaRecomendacoes()).toBe(4);
    });

    it('calcula o total de páginas corretamente para 10 itens com 4 por página', () => {
      component.larguraTela.set(1200);
      expect(component.totalPaginasRecomendacoes()).toBe(3);
    });

    it('protege a página atual quando ela ultrapassa o novo total', () => {
      component.larguraTela.set(1200);
      component.mudarPaginaRecomendacoes(3);
      expect(component.paginaSegura()).toBe(3);

      (component as any).recomendacoes.set(Array.from({ length: 5 }, (_, i) => ({ id: `livro-${i}` })));
      expect(component.paginaSegura()).toBe(2);
    });

    it('não avança para página inválida', () => {
      component.larguraTela.set(1200);
      component.mudarPaginaRecomendacoes(99);
      expect(component.paginaRecomendacoesAtual()).not.toBe(99);
    });
  });

  describe('carregarPainel — estados de carregamento, vazio e erro', () => {
    it('define erro() e finaliza carregando() quando a API de empréstimos falha', async () => {
      emprestimosServiceMock.emprestimoControllerFindAll.mockReturnValue(
        throwError(() => new Error('falha de rede')),
      );

      await (component as any).carregarPainel();

      expect(component.erro()).toContain('Não foi possível carregar');
      expect(component.carregando()).toBe(false);
    });

    it('trata resposta vazia sem quebrar', async () => {
      emprestimosServiceMock.emprestimoControllerFindAll.mockReturnValue(of([]));
      clubesServiceMock.clubeControllerFindMeusClubes.mockReturnValue(of([]));
      livrosServiceMock.livroControllerObterRecomendacoes.mockReturnValue(of([]));

      await (component as any).carregarPainel();

      expect(component.erro()).toBe('');
      expect(component.emprestimosAtivos()).toEqual([]);
      expect(component.totalLivrosLidos()).toBe(0);
      expect(component.totalPaginasLidas()).toBe(0);
      expect(component.recomendacoes()).toEqual([]);
      expect(component.carregando()).toBe(false);
    });

    it('popula os signals corretamente em caso de sucesso com dados', async () => {
      const emprestimosFalsos = [
        { data_devolucao_efetiva: '2026-01-01', exemplar: { livro: { paginas: 300 } } },
        { data_devolucao_efetiva: null, exemplar: { livro: { paginas: 200 } } },
      ];
      emprestimosServiceMock.emprestimoControllerFindAll.mockReturnValue(of(emprestimosFalsos as any));
      clubesServiceMock.clubeControllerFindMeusClubes.mockReturnValue(of([]));
      livrosServiceMock.livroControllerObterRecomendacoes.mockReturnValue(of([{ id: 'livro-1' }] as any));

      await (component as any).carregarPainel();

      expect(component.totalLivrosLidos()).toBe(1);
      expect(component.emprestimosAtivos().length).toBe(1);
      expect(component.totalPaginasLidas()).toBe(300);
      expect(component.recomendacoes().length).toBe(1);
      expect(component.erro()).toBe('');
    });
  });
});
