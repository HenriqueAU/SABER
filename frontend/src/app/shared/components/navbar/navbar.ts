import { Component, Host, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CoreAuthService } from '../../../core/auth/auth-session';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private sessionService = inject(CoreAuthService);
  private router = inject(Router);
  get isLoginPage(): boolean {
    return this.router.url === '/login'; 
  }
  perfil = this.sessionService.perfil;
  estaLogado = this.sessionService.estaLogado;

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

}
