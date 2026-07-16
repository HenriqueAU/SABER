import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { forkJoin } from 'rxjs';
import { UsuariosService } from '../../../../client/services/usuarios.service';
import { CommonModule, Location } from '@angular/common';
import Modal from 'bootstrap/js/dist/modal';
import { GenerosService, PreferenciasGeneroService } from '../../../../client';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export default class PerfilComponent implements OnInit{
  private coreAuthService = inject(CoreAuthService);
  private usuariosService = inject(UsuariosService);
  private preferenciasGeneroService = inject(PreferenciasGeneroService);
  private generosService = inject(GenerosService);
  private location = inject(Location);

  usuarioId!: string;
  usuarioData: any = null;

  tipoPerfil: string | null = null;
  erro = signal<string>('');
  imagens = Array.from({ length: 16 }, (_, i) => i);

  userForm = new FormGroup({
    nome: new FormControl('', { validators: [] }),
    email: new FormControl({ value: '', disabled: true }),
    foto_perfil: new FormControl('', { validators: [] }),
  });

  @ViewChild('successModal')
  successModalRef!: ElementRef;

  generos$? = this.generosService.generoControllerFindAll();

  preferenciasOriginais: any[] = [];

  generosSelecionados: string[] = [];

  ngOnInit(): void {
    this.usuarioId = this.coreAuthService.getId();
    this.tipoPerfil = this.coreAuthService.getPerfil();
    if (typeof window !== 'undefined') {
      const avatarLocal = localStorage.getItem('avatar_' + this.usuarioId);
      if (avatarLocal) {
        this.userForm.patchValue({ foto_perfil: avatarLocal });
      }
    }
    this.usuariosService.usuarioControllerFindOne(this.usuarioId).subscribe(usuario => {
      if (typeof window !== 'undefined') {
        const avatarLocal = localStorage.getItem('avatar_' + this.usuarioId);
        if (avatarLocal && usuario.foto_perfil !== avatarLocal) {
          usuario.foto_perfil = avatarLocal;
        }
      }
      this.userForm.patchValue(usuario);
    });

    if (this.tipoPerfil !== 'aluno') {
      return;
    }
    this.carregarPreferencias();
  }
  
  abrirModalSucesso() {
    const successModalElement = this.successModalRef.nativeElement;

    if (!successModalElement) {
      return;
    }

    const modal = new Modal(successModalElement);
    modal.show();
  }

  selecionarFotoPerfil(imagem: number) {
    this.userForm.patchValue({
      foto_perfil: `assets/imgs/avatares/${imagem}.png`
    });
  }

  carregarPreferencias() {
    this.preferenciasGeneroService
      .preferenciaGeneroControllerFindAll()
      .subscribe(data => {
        this.preferenciasOriginais = data;

        this.generosSelecionados = this.preferenciasOriginais.map(
          (pref: any) => pref.genero.id
        );
      });
  }

  cancelarEdicao() {
    this.location.back();
  }

  onReturn() {
    const modal = Modal.getInstance(this.successModalRef.nativeElement);
    modal?.hide();
    this.location.back();
  }

  onSubmit() {
    if (this.userForm.invalid) return;
    this.erro.set('');

    const formValues = this.userForm.getRawValue();
    const payload = {
      nome: formValues.nome,
      foto_perfil: formValues.foto_perfil
    };

    this.usuariosService.usuarioControllerUpdate(this.usuarioId, payload as any).subscribe({
      next: () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('avatar_' + this.usuarioId, formValues.foto_perfil || '');
        }
        if (this.tipoPerfil !== 'aluno') {
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('avatarUpdated'));
          this.abrirModalSucesso();
          return;
        }

        const idsOriginais = this.preferenciasOriginais.map(pref => pref.genero.id);
        const paraCriar = this.generosSelecionados.filter(id => !idsOriginais.includes(id));
        const paraRemover = this.preferenciasOriginais.filter(pref => !this.generosSelecionados.includes(pref.genero.id));

        const requests = [
          ...paraCriar.map(generoId =>
            this.preferenciasGeneroService.preferenciaGeneroControllerCreate({
              usuario_id: this.usuarioId,
              genero_id: generoId,
            })
          ),
          ...paraRemover.map(pref =>
            this.preferenciasGeneroService.preferenciaGeneroControllerRemove(pref.id)
          )
        ];

        if (requests.length === 0) {
          this.carregarPreferencias();
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('avatarUpdated'));
          this.abrirModalSucesso();
          return;
        }

        forkJoin(requests).subscribe({
          next: () => {
            this.carregarPreferencias();
            if (typeof window !== 'undefined') window.dispatchEvent(new Event('avatarUpdated'));
            this.abrirModalSucesso();
          },
          error: () => this.erro.set('Ocorreu um erro ao guardar as preferências.')
        });
      },
      error: (err) => {
        const msg = Array.isArray(err.error?.message) ? err.error.message.join(' | ') : err.error?.message;
        this.erro.set(msg || 'Erro ao atualizar o perfil. Verifique os dados inseridos.');
      }
    });
  }

  getClassGenero(genero: string) {
    switch (genero) {
      case 'Poesia':
        return 'genero-poesia';

      case 'Romance':
        return 'genero-romance';

      case 'Tecnologia':
        return 'genero-tecnologia';

      case 'Aventura':
        return 'genero-aventura';

      case 'Ficção Científica':
        return 'genero-ficcao-cientifica';

      case 'Filosofia':
        return 'genero-filosofia';

      case 'História':
        return 'genero-historia';

      case 'Terror':
        return 'genero-terror';

      case 'Fantasia':
        return 'genero-fantasia';

      case 'Biografias':
        return 'genero-biografias';

      default:
        return 'bg-secondary text-white';
    }
  }


  toggleGenero(id: string) {
    const index = this.generosSelecionados.indexOf(id);
    if (index >= 0) {
      this.generosSelecionados.splice(index, 1);
      return;
    }
    this.generosSelecionados.push(id);
  }

  isGeneroSelecionado(id: string): boolean {
    return this.generosSelecionados.includes(id);
  }
}
