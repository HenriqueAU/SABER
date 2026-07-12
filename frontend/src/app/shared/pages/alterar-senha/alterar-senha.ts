import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { UsuariosService } from '../../../../client/services/usuarios.service';
import { AlterarSenhaDto } from '../../../../client/models';

function senhaForteValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value || '';

    const temMaiuscula = /[A-Z]/.test(valor);
    const temNumero = /[0-9]/.test(valor);
    const temSimbolo = /[^A-Za-z0-9]/.test(valor);

    const erros: ValidationErrors = {};
    if (!temMaiuscula) erros['semMaiuscula'] = true;
    if (!temNumero) erros['semNumero'] = true;
    if (!temSimbolo) erros['semSimbolo'] = true;

    return Object.keys(erros).length > 0 ? erros : null;
  };
}

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alterar-senha.html',
  styleUrls: ['./alterar-senha.scss'],
})
export default class AlterarSenhaComponent {
  form: FormGroup;
  mensagemSucesso = signal<string>('');
  mensagemErro = signal<string>('');
  carregando = signal<boolean>(false);

  senhaAtualVisivel = false;
  novaSenhaVisivel = false;
  mostrarCriterios = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private authSession = inject(CoreAuthService);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(8), senhaForteValidator()]],
    });
  }

  toggleVisibilidadeSenhaAtual(): void {
    this.senhaAtualVisivel = !this.senhaAtualVisivel;
  }

  toggleVisibilidadeNovaSenha(): void {
    this.novaSenhaVisivel = !this.novaSenhaVisivel;
  }

  toggleCriterios() {
    this.mostrarCriterios.update((v) => !v);
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.carregando.set(true);
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    const token = this.authSession.getToken();

    if (!token) {
      this.mensagemErro.set('Utilizador não autenticado.');
      this.carregando.set(false);
      return;
    }

    const usuarioId = this.authSession.getId()

    if(!usuarioId) {
      this.mensagemErro.set('Erro ao processar sua sessão')
      this.carregando.set(false);
      return;
    }

    if (!usuarioId) {
      this.mensagemErro.set('Não foi possível identificar a sua conta.');
      this.carregando.set(false);
      return;
    }

    const { senhaAtual, novaSenha } = this.form.value;
    const alterarSenhaDto: AlterarSenhaDto = {
      senha_atual: senhaAtual,
      nova_senha: novaSenha,
    };

    this.usuariosService.usuarioControllerAlterarSenha(usuarioId, alterarSenhaDto).subscribe({
      next: () => {
        this.mensagemSucesso.set('Senha alterada com sucesso!');
        this.form.reset();
        this.carregando.set(false);
      },
      error: (err) => {
        const msg = err.error?.message;
        this.mensagemErro.set(
          Array.isArray(msg)
            ? msg[0]
            : msg || 'Erro ao alterar a senha. Verifique a sua senha atual.',
        );
        this.carregando.set(false);
      },
    });
  }
}
