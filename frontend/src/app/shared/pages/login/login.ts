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
  styleUrl: './login.css',
})
export default class LoginComponent  {
  sessionService = inject(CoreAuthService);
  authHttpService = inject(AuthService);
  router = inject(Router);
  preferenciaGeneroService = inject(PreferenciasGeneroService);

 loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  senha: new FormControl('', [Validators.required]),
 });

 erroLogin = signal('')

 onSubmit() {
  const credenciais = {
    email: this.loginForm.value.email!,
    senha: this.loginForm.value.senha!,
  }
  this.authHttpService.authControllerLogin(credenciais)
  .subscribe({
    next: (res) => {
      this.sessionService.setToken(res.access_token);
      this.sessionService.perfil.set(this.sessionService.getPerfil());
      this.sessionService.estaLogado.set(true);
      this.redirecionarAposLogin();
    },
    error: (err) => {
      this.erroLogin.set('Credenciais inválidas!');
    },
  });
 };
  private redirecionarAposLogin() {
    if (this.sessionService.getPerfil() !== TipoPerfil.ALUNO) {
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
