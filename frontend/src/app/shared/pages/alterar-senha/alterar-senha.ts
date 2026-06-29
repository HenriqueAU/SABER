import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { BASE_PATH_DEFAULT } from '../../../../client/tokens';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alterar-senha.html',
  styleUrls: ['./alterar-senha.css']
})
export default class AlterarSenhaComponent {
  form: FormGroup;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  carregando: boolean = false;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authSession = inject(CoreAuthService);
  private cdr = inject(ChangeDetectorRef);
  private basePath = inject(BASE_PATH_DEFAULT);

  constructor() {
    this.form = this.fb.group({
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.carregando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const token = this.authSession.getToken();

    if (!token) {
      this.mensagemErro = 'Utilizador não autenticado.';
      this.carregando = false;
      this.cdr.detectChanges();
      return;
    }

    let usuarioId = '';
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      usuarioId = payload.id;
    } catch (e) {
      this.mensagemErro = 'Erro ao processar a sua sessão.';
      this.carregando = false;
      this.cdr.detectChanges();
      return;
    }

    if (!usuarioId) {
      this.mensagemErro = 'Não foi possível identificar a sua conta.';
      this.carregando = false;
      this.cdr.detectChanges();
      return;
    }

    const { senhaAtual, novaSenha } = this.form.value;
    const payload = { 
      senha_atual: senhaAtual, 
      nova_senha: novaSenha 
    };

    this.http.patch(`${this.basePath}/usuario/${usuarioId}/alterar-senha`, payload).subscribe({
      next: () => {
        this.mensagemSucesso = 'Senha alterada com sucesso!';
        this.form.reset();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message;
        if (err.status === 400 && msg) {
          this.mensagemErro = Array.isArray(msg) ? msg[0] : msg;
        } else {
          this.mensagemErro = 'Ocorreu um erro ao alterar a senha. Tente novamente.';
        }
        
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
