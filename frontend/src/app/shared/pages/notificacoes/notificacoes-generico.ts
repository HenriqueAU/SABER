import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacoesService } from '../../../../client/services/notificacoes.service';
import { Router } from '@angular/router';

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  data: Date;
  lida: boolean;
  mensagemLimpa?: string;
  clubeId?: string;
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
  private router = inject(Router);

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.notificacoesService.notificacaoControllerFindAll().subscribe({
      next: (dados: Notificacao[]) => {
        const formatadas = dados.map(notif => {
          const hasLink = notif.mensagem.match(/\[CLUBE:(.*?)\]/);
          return {
            ...notif,
            mensagemLimpa: notif.mensagem.replace(/\[CLUBE:.*?\]/, ''),
            clubeId: hasLink ? hasLink[1] : undefined
          };
        });
        this.notificacoes.set(formatadas);
        this.carregando.set(false);
      },
      error: () => {
        this.mensagemErro.set('Não foi possível carregar as suas notificações.');
        this.carregando.set(false);
      }
    });
  }

  marcarComoLida(notificacao: Notificacao, evento?: Event) {
    if (evento) evento.stopPropagation();
    if (notificacao.lida) return;
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
  
  abrirNotificacao(notificacao: Notificacao) {
    if (!notificacao.lida) {
      this.marcarComoLida(notificacao);
    }

    if (notificacao.clubeId) {
      this.router.navigate(['/home'], { queryParams: { abrirClubeFeedbacks: notificacao.clubeId } });
    }
  }
}
