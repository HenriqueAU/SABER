import { Component, HostListener, inject, signal, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { UsuariosService } from '../../../../client';
import { NotificacoesService } from '../../../../client/services/notificacoes.service';
import { EmprestimosService } from '../../../../client/services/emprestimos.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private coreAuthService = inject(CoreAuthService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private notificacoesService = inject(NotificacoesService);
  private emprestimosService = inject(EmprestimosService);

  get isLoginPage(): boolean { return this.router.url === '/login'; }
  get isOnboardingPage(): boolean { return this.router.url === '/onboarding'; }

  perfil = this.coreAuthService.perfil;
  estaLogado = this.coreAuthService.estaLogado;

  usuarioId!: string;
  fotoPerfil = this.coreAuthService.fotoPerfil;
  notificacoesNaoLidas = signal<number>(0);

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('avatarUpdated', () => {
        if (this.estaLogado()) {
          this.usuariosService.usuarioControllerFindOne(this.coreAuthService.getId()).subscribe(usuario => {
            this.fotoPerfil.set(usuario.foto_perfil || null);
          });
        }
      });
    }
    effect(() => {
      if (this.estaLogado()) {
        this.usuarioId = this.coreAuthService.getId();
        
        this.usuariosService.usuarioControllerFindOne(this.usuarioId).subscribe(usuario => {
          this.fotoPerfil.set(usuario.foto_perfil || null);
        });

        if (this.perfil() === 'bibliotecario') {
          this.emprestimosService.emprestimoControllerFindAll().subscribe({
            next: (dados: any[]) => {
              const hoje = new Date();
              const atrasados = dados.filter((e: any) =>
                !e.data_devolucao_efetiva &&
                new Date(e.data_devolucao_esperada) < hoje
              ).length;
              this.notificacoesNaoLidas.set(atrasados);
            }
          });
        } else {
          this.notificacoesService.notificacaoControllerFindAll().subscribe({
            next: (notificacoes: any[]) => {
              const naoLidas = notificacoes.filter(n => !n.lida).length;
              this.notificacoesNaoLidas.set(naoLidas);
            }
          });
        }
      } else {
        this.fotoPerfil.set(null);
        this.notificacoesNaoLidas.set(0);
      }
    });
  }

  navbarHidden = false;
  private lastScrollTop = 0;
  
  scrollToTop(event: Event) {
    event.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  scrollToBottom(event: Event) {
    event.preventDefault();

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

      if (currentScroll > this.lastScrollTop && currentScroll > 80) {
        this.navbarHidden = true;
      } else {
        this.navbarHidden = false;
      }

      this.lastScrollTop = Math.max(currentScroll, 0);
  }

  logOut() {
    this.coreAuthService.removeToken();
    this.coreAuthService.estaLogado.set(false);
    this.coreAuthService.perfil.set(null);

    this.router.navigate(['/onboarding']);
  }
  
  getLoginOrHomeRoute(): string {
    return this.estaLogado() ? '/home' : '/login';
  }
}
