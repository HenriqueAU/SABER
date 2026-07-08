import { Component, inject } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { TipoPerfil } from '../../../core/auth/tipo-perfil.enum';
import NotificacoesGenericoComponent from './notificacoes-generico';
import NotificacoesBibliotecarioComponent from './bibliotecario/notificacoes-bibliotecario';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [NotificacoesGenericoComponent, NotificacoesBibliotecarioComponent],
  templateUrl: './notificacoes.html',
  styleUrls: ['./notificacoes.scss']
})
export default class NotificacoesComponent {
  sessionService = inject(CoreAuthService);
  perfil = this.sessionService.perfil;
  TipoPerfil = TipoPerfil;
}