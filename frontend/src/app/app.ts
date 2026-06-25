import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, Router} from '@angular/router';
import { CoreAuthService } from './core/auth/auth-session';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  private sessionService = inject(CoreAuthService);
  private router = inject(Router);
  get isRotaPublica(): boolean {return ['/login', '/onboarding'].includes(this.router.url)}
  perfil = this.sessionService.perfil;
  estaLogado = this.sessionService.estaLogado;
}
