import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { InstituicaoService } from '../../../client/services/instituicao.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import Modal from 'bootstrap/js/dist/modal';

@Component({
  selector: 'app-instituicao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './instituicao.html',
  styleUrls: ['./instituicao.scss']
})
export default class InstituicaoComponent implements OnInit {
  @ViewChild('instituicaoModal') instituicaoModalRef!: ElementRef;
  form!: FormGroup;
  carregando = signal(true);
  enviando = signal(false);
  mensagemSucesso = signal('');
  mensagemErro = signal('');
  mensagemErroGeral = signal('');
  carregandoCidades = signal(false);
  instituicaoId: string | null = null;

  instituicaoAtual = signal<{ nome: string; tipo: string; estado: string; cidade: string } | null>(null);

  tiposInstituicao = [
    { label: 'Escola', value: 'escola' },
    { label: 'Faculdade', value: 'faculdade' }
  ];
  estados: any[] = [];
  cidades: any[] = [];

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private instituicaoService = inject(InstituicaoService);
  private authSession = inject(CoreAuthService);

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
      next: (dados) => { this.estados = dados; },
      error: () => {}
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
    this.carregandoCidades.set(true);
    this.form.get('cidade')?.disable();

    this.http.get<any[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`).subscribe({
      next: (dados) => {
        this.cidades = dados;
        this.form.get('cidade')?.enable();
        this.form.get('cidade')?.setValue(cidadePreSelecionada || '');
        this.carregandoCidades.set(false);
      },
      error: () => {
        this.carregandoCidades.set(false);
      }
    });
  }

 carregarDados(): void {
    this.instituicaoId = this.authSession.getInstituicao();

    if (!this.instituicaoId) {
      this.mensagemErroGeral.set('Instituição não vinculada ao seu perfil de Gestor.');
      this.carregando.set(false);
      return;
    }

    this.instituicaoService.instituicaoControllerFindOne(this.instituicaoId).subscribe({
      next: (dados: any) => {
        const inst = dados?.data || dados;
        if (inst) {

          this.instituicaoAtual.set({
            nome: inst.nome || '',
            tipo: inst.tipo || '',
            estado: inst.estado || '',
            cidade: inst.cidade || ''
          });

          if (inst.estado) {
            this.carregarCidadesIBGE(inst.estado, inst.cidade);
          }
        }
        this.carregando.set(false);
      },
      error: () => {
        this.mensagemErroGeral.set('Não foi possível carregar os dados da instituição.');
        this.carregando.set(false);
      }
    });
  }

 onSubmit(): void {
  if (this.form.invalid || !this.instituicaoId) {
    this.form.markAllAsTouched();
    return;
  }

  this.enviando.set(true);
  this.mensagemSucesso.set('');
  this.mensagemErro.set('');

  const updateDto = this.form.getRawValue();

  this.instituicaoService.instituicaoControllerUpdate(this.instituicaoId, updateDto).subscribe({
    next: (resposta: any) => {
      const inst = resposta?.data || resposta;

      this.instituicaoAtual.set({
        nome: inst.nome || '',
        tipo: inst.tipo || '',
        estado: inst.estado || '',
        cidade: inst.cidade || ''
      });

      this.mensagemSucesso.set('Dados da instituição atualizados com sucesso!');
      this.enviando.set(false);
      setTimeout(() => this.fecharModal(), 1500);
    },
    error: (err: any) => {
      const msg = err.error?.message;
      if (err.status === 400 && msg) {
        this.mensagemErro.set(Array.isArray(msg) ? msg[0] : msg);
      } else {
        this.mensagemErro.set('Ocorreu um erro ao atualizar os dados. Tente novamente.');
      }
      this.enviando.set(false);
    }
  });
}

  abrirModal(): void {
    this.mensagemSucesso.set('');
    this.mensagemErro.set('');

    const atual = this.instituicaoAtual();
    if (atual) {
      this.form.patchValue({
        nome: atual.nome,
        tipo: atual.tipo,
        estado: atual.estado
      }, { emitEvent: false });

      if (atual.estado) {
        this.carregarCidadesIBGE(atual.estado, atual.cidade);
      }
    }

    const modal = new Modal(this.instituicaoModalRef.nativeElement);
    modal.show();
  }

  fecharModal(): void {
    const modal = Modal.getInstance(this.instituicaoModalRef.nativeElement);
    modal?.hide();

    const atual = this.instituicaoAtual();
    if (atual) {
      this.form.patchValue({
        nome: atual.nome,
        tipo: atual.tipo,
        estado: atual.estado,
        cidade: atual.cidade
      }, { emitEvent: false });
    }
  }
}