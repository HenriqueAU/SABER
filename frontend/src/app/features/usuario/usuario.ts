import { Component,
  OnInit,
  inject,
  ChangeDetectorRef
 } from '@angular/core';
 import { CommonModule } from '@angular/common';
 import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms'
 import { UsuariosService } from '../../../client/services/usuarios.service'; 
 import { CoreAuthService } from '../../core/auth/auth-session';
 import { TipoPerfil } from '../../core/auth/tipo-perfil.enum'

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.css',
})
export default class UsuarioComponent implements OnInit {
  usuarios: any[] = [];
  carregando: boolean = true;
  enviando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  form!: FormGroup;

  TipoPerfilEnum = TipoPerfil;
  perfis = Object.values(TipoPerfil);

  mostrarForm = false;
  termoBusca = '';
  PerfilSelecionado = '';

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private usuariosService = inject(UsuariosService);
  private authService = inject(CoreAuthService);

  get usuariosFiltrados(): any[] {
    return this.usuarios.filter((usuario) => {
      const nomeOk =
      !this.termoBusca ||
        usuario.nome.toLowerCase().includes(this.termoBusca.toLowerCase());

      const perfilOk =
      !this.PerfilSelecionado ||
        usuario.perfil === this.PerfilSelecionado;

      return nomeOk && perfilOk;
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150),
        Validators.pattern(/^[A-Za-zÀ-ÿ' -]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(255),
        Validators.email
      ]],
      senha: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/)
      ]],
      perfil: ['', [Validators.required]],
      data_nasc: ['', [Validators.required]],
      foto_perfil: ['', [Validators.maxLength(500)]]
    });

    this.carregarUsuarios();
  }

  abrirFormCadastro(){
    this.form.reset();
    this.mostrarForm = true;
  }

  fecharFormCadastro(){
    this.mostrarForm = false;
  }

  private getInstituicaoId(): string | null {
    const token = this.authService.getToken();
    if (!token) return null;

    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload.instituicao || null;
    } catch (e) {
      return null;
    }
  }

  carregarUsuarios() {
    this.carregando = true;
    this.mensagemErro = '';

    this.usuariosService.usuarioControllerFindAll().subscribe({
      next: (dados: any) => {
        this.usuarios = Array.isArray(dados) ? dados : (dados?.data || dados?.items || []);
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar a lista de usuários.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const instituicaoId = this.getInstituicaoId();
    if (!instituicaoId) {
      this.mensagemErro = 'Não foi possível identificar a instituição do utilizador logado.';
      return;
    }

    this.enviando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const valores = this.form.value;
    const payload: any = {
      instituicao_id: instituicaoId,
      nome: valores.nome,
      email: valores.email,
      senha: valores.senha,
      perfil: valores.perfil,
      data_nasc: valores.data_nasc
    };

    if (valores.foto_perfil) {
      payload.foto_perfil = valores.foto_perfil;
    }

    this.usuariosService.usuarioControllerCreate(payload).subscribe({
      next: () => {
        this.mensagemSucesso = 'Usuário cadastrado com sucesso!';
        this.form.reset();
        this.enviando = false;
        this.carregarUsuarios();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message;
        if (err.status === 400 && msg) {
          this.mensagemErro = Array.isArray(msg) ? msg[0] : msg;
        } else {
          this.mensagemErro = 'Ocorreu um erro ao cadastrar o usuário. Tente novamente.';
        }
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }

}
