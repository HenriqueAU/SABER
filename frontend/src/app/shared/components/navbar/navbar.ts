import { Component, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { UsuariosService } from '../../../../client';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  private coreAuthService = inject(CoreAuthService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  get isLoginPage(): boolean {
    return this.router.url === '/login'; 
  }
  get isOnboardingPage(): boolean {
    return this.router.url === '/onboarding';
  }

  perfil = this.coreAuthService.perfil;
  estaLogado = this.coreAuthService.estaLogado;

  usuarioId!: string;
  fotoPerfil: string | null = null;

  ngOnInit(): void {
    this.usuarioId = this.coreAuthService.getId();
    
    this.usuariosService.usuarioControllerFindOne(this.usuarioId).subscribe(usuario => {
      this.fotoPerfil = usuario.foto_perfil;
    })

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
