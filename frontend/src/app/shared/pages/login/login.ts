import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { AuthService } from '../../../../client/services/auth.service';
import { Router } from '@angular/router';
import { TipoPerfil } from '../../../core/auth/tipo-perfil.enum';
import { PreferenciasGeneroService } from '../../../../client/services/preferenciasGenero.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class LoginComponent  {
  coreAuthService = inject(CoreAuthService);
  authHttpService = inject(AuthService);
  router = inject(Router);
  preferenciaGeneroService = inject(PreferenciasGeneroService);

 loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  senha: new FormControl('', [Validators.required]),
 });

 erroLogin = signal('')

 senhaVisivel = false;

 toggleVisibilidadeSenha(): void {
  this.senhaVisivel = !this.senhaVisivel;
 }

 onSubmit() {
  const credenciais = {
    email: this.loginForm.value.email!,
    senha: this.loginForm.value.senha!,
  }
  this.authHttpService.authControllerLogin(credenciais)
  .subscribe({
    next: (res) => {
      this.coreAuthService.setToken(res.access_token);
      this.coreAuthService.perfil.set(this.coreAuthService.getPerfil());
      this.coreAuthService.fotoPerfil.set(this.coreAuthService.getFotoPerfil());
      this.coreAuthService.estaLogado.set(true);
      this.redirecionarAposLogin();
    },
    error: (err) => {
      this.erroLogin.set('Credenciais inválidas. Por favor, tente novamente.');
    },
  });
 };
  private redirecionarAposLogin() {
    if (this.coreAuthService.getPerfil() !== TipoPerfil.ALUNO) {
      this.router.navigate(['/home']);
      return;
    }

    this.preferenciaGeneroService.preferenciaGeneroControllerFindAll().subscribe({
      next: (preferencias) => {
        const semPreferencias = !preferencias || preferencias.length === 0;
        this.router.navigate([semPreferencias ? '/primeiro-acesso' : '/home']);
      },
      error: () => this.router.navigate(['/home']), 
    });
  }
}
