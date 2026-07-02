import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { AuthService } from '../../../../client/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class LoginComponent  {
  sessionService = inject(CoreAuthService);
  authHttpService = inject(AuthService);
  router = inject(Router);

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
      this.sessionService.setToken(res.access_token);
      this.sessionService.perfil.set(this.sessionService.getPerfil());
      this.sessionService.estaLogado.set(true);
      this.router.navigate(['/home']);
    },
    error: (err) => {
      this.erroLogin.set('Credenciais inválidas. Por favor, tente novamente.');
    },
  });
 };
}
