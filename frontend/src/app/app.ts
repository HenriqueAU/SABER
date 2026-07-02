import { Component, inject, signal, effect } from '@angular/core';
import { RouterOutlet, RouterLink, Router} from '@angular/router';
import { CoreAuthService } from './core/auth/auth-session';
import { UsuariosService } from '../client/services/usuarios.service';

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
  private usuariosService = inject(UsuariosService);

  usuarioData = signal<any>(null);
  get isRotaPublica(): boolean {return ['/login', '/onboarding'].includes(this.router.url)}
  get esconderNavbar(): boolean { return ['/perfil', '/alterar-senha'].includes(this.router.url); }
  perfil = this.sessionService.perfil;
  estaLogado = this.sessionService.estaLogado;

  constructor() {
    effect(() => {
      if (this.estaLogado()) {
        this.carregarDadosUsuario();
      } else {
        this.usuarioData.set(null);
      }
    });
  }

  carregarDadosUsuario() {
    const token = this.sessionService.getToken();
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      
      this.usuariosService.usuarioControllerFindOne(payload.id).subscribe({
        next: (data) => this.usuarioData.set(data),
        error: () => this.usuarioData.set(null)
      });
    }
  }
}
