import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notificacao {
  id: number;
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
  styleUrls: ['./notificacoes.css']
})
export default class NotificacoesComponent {
  notificacoes: Notificacao[] = [
    {
      id: 1,
      titulo: 'Novo Clube do Livro',
      mensagem: 'O clube "Fãs de Ficção" acabou de ser criado na sua instituição. Participe!',
      data: new Date(),
      lida: false
    },
    {
      id: 2,
      titulo: 'Empréstimo Vencendo',
      mensagem: 'Lembrete: O livro "1984" precisa de ser devolvido amanhã à biblioteca.',
      data: new Date(Date.now() - 86400000),
      lida: true
    }
  ];

  marcarComoLida(notificacao: Notificacao) {
    notificacao.lida = true;
  }
}