import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { CoreAuthService } from './core/auth/auth-session';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  private sessionService = inject(CoreAuthService);
  perfil = this.sessionService.perfil;
  estaLogado = this.sessionService.estaLogado;
}
