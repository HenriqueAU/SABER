import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacoes.html',
  styleUrls: ['./notificacoes.scss']
})
export default class NotificacoesComponent implements OnInit {
  notificacoes: Notificacao[] = [];
  carregando: boolean = true;
  mensagemErro: string = '';

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private basePath = inject(BASE_PATH_DEFAULT);

  ngOnInit(): void {
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    this.carregando = true;
    this.mensagemErro = '';

    this.http.get<Notificacao[]>(`${this.basePath}/notificacoes`).subscribe({
      next: (dados) => {
        this.notificacoes = dados;
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar as suas notificações.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  marcarComoLida(notificacao: Notificacao) {
    this.http.patch(`${this.basePath}/notificacoes/${notificacao.id}/lida`, {}).subscribe({
      next: () => {
        notificacao.lida = true;
        this.cdr.detectChanges();
      },
      error: () => {
      }
    });
  }
}