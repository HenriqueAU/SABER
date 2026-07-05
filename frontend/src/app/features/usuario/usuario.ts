import { Component,
  OnInit,
  inject,
  signal, 
  computed 
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
  styleUrl: './usuario.scss',
})
export default class UsuarioComponent implements OnInit {
  usuarios = signal<any[]>([]);
  carregando = signal(true);
  enviando = signal(false);
  mensagemSucesso = signal('');
  mensagemErro = signal('');
  form!: FormGroup;

  TipoPerfilEnum = TipoPerfil;
  perfis = Object.values(TipoPerfil);

  mostrarForm = signal(false);
  termoBusca = signal('');
  PerfilSelecionado = signal('');

  readonly ITENS_POR_PAGINA = 30;
  paginaAtual = signal(1);

  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private authService = inject(CoreAuthService);

  usuariosFiltrados = computed(() =>
    this.usuarios().filter((usuario) => {
      const nomeOk =
        !this.termoBusca() ||
        usuario.nome.toLowerCase().includes(this.termoBusca().toLowerCase());
      const perfilOk =
        !this.PerfilSelecionado() ||
        usuario.perfil === this.PerfilSelecionado();
      return nomeOk && perfilOk;
    })
  );

  fimDaPagina = computed(() =>
    Math.min(this.paginaAtual() * this.ITENS_POR_PAGINA, this.usuariosFiltrados().length)
  );

  totalPaginas = computed(() =>
    Math.ceil(this.usuariosFiltrados().length / this.ITENS_POR_PAGINA) || 1
  );

  usuariosPaginados = computed(() => {
    const inicio = (this.paginaAtual() - 1) * this.ITENS_POR_PAGINA;
    return this.usuariosFiltrados().slice(inicio, inicio + this.ITENS_POR_PAGINA);
  });

  paginas = computed(() =>
    Array.from({ length: this.totalPaginas() }, (_, i) => i + 1)
  );

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaAtual.set(pagina);
  }

  onFiltroChange(): void {
    this.paginaAtual.set(1);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150), Validators.pattern(/^[A-Za-zÀ-ÿ' -]+$/)]],
      email: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255), Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/)]],
      perfil: ['', [Validators.required]],
      data_nasc: ['', [Validators.required]],
      foto_perfil: ['', [Validators.maxLength(500)]]
    });

    this.carregarUsuarios();
  }

  abrirFormCadastro() {
    this.form.reset();
    this.mostrarForm.set(true);
  }

  fecharFormCadastro() {
    this.mostrarForm.set(false);
  }

  carregarUsuarios() {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.usuariosService.usuarioControllerFindAll().subscribe({
      next: (dados: any) => {
        this.usuarios.set(Array.isArray(dados) ? dados : (dados?.data || dados?.items || []));
        this.paginaAtual.set(1);
        this.carregando.set(false);
      },
      error: () => {
        this.mensagemErro.set('Não foi possível carregar a lista de usuários.');
        this.carregando.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const instituicaoId = this.authService.getInstituicao();
    if (!instituicaoId) {
      this.mensagemErro.set('Não foi possível identificar a instituição do utilizador logado.');
      return;
    }

    this.enviando.set(true);
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

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
        this.mensagemSucesso.set('Usuário cadastrado com sucesso!');
        this.form.reset();
        this.enviando.set(false);
        this.carregarUsuarios();
      },
      error: (err) => {
        const msg = err.error?.message;
        if (err.status === 400 && msg) {
          this.mensagemErro.set(Array.isArray(msg) ? msg[0] : msg);
        } else {
          this.mensagemErro.set('Ocorreu um erro ao cadastrar o usuário. Tente novamente.');
        }
        this.enviando.set(false);
      }
    });
  }

}
