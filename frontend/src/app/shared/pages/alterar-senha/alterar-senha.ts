import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from '../../../../client/services/usuarios.service';
import { CoreAuthService } from '../../../core/auth/auth-session';

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
  private usuariosService = inject(UsuariosService);
  private authSession = inject(CoreAuthService);

  constructor() {
    this.form = this.fb.group({
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]]
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
      return;
    }

    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    const usuarioId = payload.id;

    if (!usuarioId) {
      this.mensagemErro = 'Não foi possível identificar a sua conta.';
      this.carregando = false;
      return;
    }

    const { novaSenha } = this.form.value;
    const updatePayload = { senha: novaSenha } as any;

    this.usuariosService.usuarioControllerUpdate(usuarioId, updatePayload).subscribe({
      next: () => {
        this.mensagemSucesso = 'Senha alterada com sucesso!';
        this.form.reset();
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro na atualização:', err);
        this.mensagemErro = 'Erro ao alterar a senha. Verifique os dados e tente novamente.';
        this.carregando = false;
      }
    });
  }
}
