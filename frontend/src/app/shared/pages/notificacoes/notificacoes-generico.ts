import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BASE_PATH_DEFAULT } from '../../../../client/tokens';

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
  styleUrls: ['./notificacoes.scss']
})
export default class NotificacoesGenericoComponent implements OnInit {
  notificacoes = signal<Notificacao[]>([]);
  carregando = signal<boolean>(true);
  mensagemErro = signal<string>('');

  private http = inject(HttpClient);
  private basePath = inject(BASE_PATH_DEFAULT);

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.http.get<Notificacao[]>(`${this.basePath}/notificacoes`).subscribe({
      next: (dados) => {
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
    this.http.patch(`${this.basePath}/notificacoes/${notificacao.id}/lida`, {}).subscribe({
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
