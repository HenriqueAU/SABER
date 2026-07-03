import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InstituicaoService } from '../../../client/services/instituicao.service';
import { CoreAuthService } from '../../core/auth/auth-session';

@Component({
  selector: 'app-instituicao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './instituicao.html',
  styleUrls: ['./instituicao.scss']
})
export default class InstituicaoComponent implements OnInit {
  form!: FormGroup;
  carregando: boolean = true;
  enviando: boolean = false;
  mostrarModal: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  instituicaoId: string | null = null;

  tiposInstituicao = [
    { label: 'Escola', value: 'escola' },
    { label: 'Faculdade', value: 'faculdade' }
  ];
  estados: any[] = [];
  cidades: any[] = [];
  carregandoCidades: boolean = false;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private instituicaoService = inject(InstituicaoService);
  private authSession = inject(CoreAuthService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      tipo: ['', Validators.required],
      estado: ['', Validators.required],
      cidade: [{ value: '', disabled: true }, Validators.required]
    });

    this.carregarEstadosIBGE();
    this.escutarMudancasDeEstado();
    this.carregarDados();
  }

  carregarEstadosIBGE(): void {
    this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').subscribe({
      next: (dados) => {
        this.estados = dados;
        this.cdr.detectChanges();
      },
      error: () => {
      }
    });
  }

  escutarMudancasDeEstado(): void {
    this.form.get('estado')?.valueChanges.subscribe(uf => {
      if (uf) {
        this.carregarCidadesIBGE(uf);
      } else {
        this.cidades = [];
        this.form.get('cidade')?.disable();
        this.form.get('cidade')?.setValue('');
      }
    });
  }

  carregarCidadesIBGE(uf: string, cidadePreSelecionada?: string): void {
    this.carregandoCidades = true;
    this.form.get('cidade')?.disable();
    this.cdr.detectChanges();

    this.http.get<any[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`).subscribe({
      next: (dados) => {
        this.cidades = dados;
        this.form.get('cidade')?.enable();
        
        if (cidadePreSelecionada) {
          this.form.get('cidade')?.setValue(cidadePreSelecionada);
        } else {
          this.form.get('cidade')?.setValue('');
        }
        
        this.carregandoCidades = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregandoCidades = false;
        this.cdr.detectChanges();
      }
    });
  }
  carregarDados(): void {
    const token = this.authSession.getToken();
    if (!token) {
      this.mensagemErro = 'Sessão inválida. Faça login novamente.';
      this.carregando = false;
      return;
    }

    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      this.instituicaoId = payload.instituicao; 
    } catch (e) {
      this.mensagemErro = 'Erro ao processar as credenciais.';
      this.carregando = false;
      return;
    }

    if (!this.instituicaoId) {
      this.mensagemErro = 'Instituição não vinculada ao seu perfil de Gestor.';
      this.carregando = false;
      return;
    }

    this.instituicaoService.instituicaoControllerFindOne(this.instituicaoId).subscribe({
      next: (dados: any) => {
        const inst = dados?.data || dados;
        if (inst) {
          this.form.patchValue({
            nome: inst.nome || '',
            tipo: inst.tipo || '',
            cidade: inst.cidade || '',
            estado: inst.estado || ''
          }, { emitEvent: false });
          if (inst.estado) {
            this.carregarCidadesIBGE(inst.estado, inst.cidade);
          } else {
            this.form.patchValue({ cidade: inst.cidade || '' }, { emitEvent: false });
          }
        }
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar os dados da instituição.';
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.instituicaoId) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const updateDto = this.form.getRawValue();

    this.instituicaoService.instituicaoControllerUpdate(this.instituicaoId, updateDto).subscribe({
      next: () => {
        this.mensagemSucesso = 'Dados da instituição atualizados com sucesso!';
        this.enviando = false;
        setTimeout(() => this.fecharModal(), 1500);
          this.cdr.detectChanges();
      },
      error: (err: any) => {
        const msg = err.error?.message;
        if (err.status === 400 && msg) {
          this.mensagemErro = Array.isArray(msg) ? msg[0] : msg;
        } else {
          this.mensagemErro = 'Ocorreu um erro ao atualizar os dados. Tente novamente.';
        }
        this.enviando = false;
        this.cdr.detectChanges();
      }
    });
  }
  abrirModal(): void {
  this.mostrarModal = true;
}

fecharModal(): void {
  this.mostrarModal = false;
  this.mensagemSucesso = '';
  this.mensagemErro = '';
}
}