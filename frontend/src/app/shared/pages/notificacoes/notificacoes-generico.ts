import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacoesService } from '../../../../client/services/notificacoes.service';

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  data: Date;
  lida: boolean;
}

@Component({
  selector: 'app-notificacoes-generico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacoes-generico.html',
})
export default class NotificacoesGenericoComponent implements OnInit {
  notificacoes = signal<Notificacao[]>([]);
  carregando = signal<boolean>(true);
  mensagemErro = signal<string>('');

  private notificacoesService = inject(NotificacoesService);

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.notificacoesService.notificacaoControllerFindAll().subscribe({
      next: (dados: Notificacao[]) => {
        this.notificacoes.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.mensagemErro.set('Não foi possível carregar as suas notificações.');
        this.carregando.set(false);
      }
    });
  }

  marcarComoLida(notificacao: Notificacao) {
    this.notificacoesService.notificacaoControllerMarkAsRead(notificacao.id).subscribe({
      next: () => {
        this.notificacoes.update(notifs =>
          notifs.map(n => n.id === notificacao.id ? { ...n, lida: true } : n)
        );
      },
      error: () => {
        this.mensagemErro.set(`Não foi possível marcar "${notificacao.titulo}" como lida.`);
      }
    });
  }
}