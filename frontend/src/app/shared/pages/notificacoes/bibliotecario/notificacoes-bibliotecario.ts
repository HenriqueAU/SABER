import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmprestimosService } from '../../../../../client/services/emprestimos.service';

interface NotificacaoAtraso {
  id: string;
  nomeAluno: string;
  tituloLivro: string;
  dataLimite: Date;
  diasAtraso: number;
}

@Component({
  selector: 'app-notificacoes-bibliotecario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacoes-bibliotecario.html',
})
export default class NotificacoesBibliotecarioComponent implements OnInit {
  notificacoes = signal<NotificacaoAtraso[]>([]);
  carregando = signal<boolean>(true);
  mensagemErro = signal<string>('');

  private emprestimosService = inject(EmprestimosService);

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.emprestimosService.emprestimoControllerFindAll().subscribe({
      next: (dados: any[]) => {
        const hoje = new Date();

        const atrasados = dados
          .filter((e: any) =>
            !e.data_devolucao_efetiva &&
            e.status !== 'perdido' &&
            e.status !== 'danificado' &&
            new Date(e.data_devolucao_esperada) < hoje
          )
          .map((e: any) => ({
            id: e.id,
            nomeAluno: e.usuario?.nome || 'Desconhecido',
            tituloLivro: e.exemplar?.livro?.titulo || 'Livro Desconhecido',
            dataLimite: e.data_devolucao_esperada,
            diasAtraso: this.calcularDiasAtraso(e.data_devolucao_esperada)
          }))
          .sort((a, b) => b.diasAtraso - a.diasAtraso);

        this.notificacoes.set(atrasados);
        this.carregando.set(false);
      },
      error: () => {
        this.mensagemErro.set('Não foi possível carregar as notificações de atraso.');
        this.carregando.set(false);
      }
    });
  }

  private calcularDiasAtraso(dataLimite: string | Date): number {
    const limite = new Date(dataLimite).setHours(0, 0, 0, 0);
    const hoje = new Date().setHours(0, 0, 0, 0);
    const diffMs = hoje - limite;
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
}