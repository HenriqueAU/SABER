import { Component } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { Observable, forkJoin } from 'rxjs';
import { UsuáriosService } from '../../../../client/services/usuarios.service';
import { Location, CommonModule } from '@angular/common';
import { PreferênciasDeGêneroService } from '../../../../client/services/preferenciasDeGenero.service';
import { GênerosService } from '../../../../client/services/generos.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export default class PerfilComponent {

  usuarioId!: string;

  tipoPerfil: string | null = null;

  userForm = new FormGroup({
    nome: new FormControl('', {
      validators: []
    }),

    email: new FormControl('', {
      validators: []
    }),

    foto_perfil: new FormControl('', {
      validators: []
    }),
  })

  generos$?: Observable<any>;

  preferenciasOriginais: any[] = [];

  generosSelecionados: string[] = [];

  constructor(
    private coreAuthService: CoreAuthService,
    protected usuariosService: UsuáriosService,
    protected preferenciasGeneroService: PreferênciasDeGêneroService,
    protected generosService: GênerosService,
    protected router: Router,
    private location: Location,
  ) {
    const token = this.coreAuthService.getToken();

    if (token) {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      this.usuarioId = payload.id;
      this.tipoPerfil = this.coreAuthService.getPerfil();

      this.usuariosService.usuarioControllerFindOne(this.usuarioId).subscribe(usuario => {
        this.userForm.patchValue(usuario);
      })

      if (this.tipoPerfil !== 'aluno') {
        return;
      }

      this.generos$ = this.generosService.generoControllerFindAll();

      this.preferenciasGeneroService
        .preferenciaGeneroControllerFindAll()
        .subscribe(data => {
          this.preferenciasOriginais = data
            .filter((pref: any) => pref.usuario.id === this.usuarioId);

          this.generosSelecionados = this.preferenciasOriginais.map(
            (pref: any) => pref.genero.id
          );
        });
    }
  }

  private abrirModalSucesso() {
    const modalElement = document.getElementById('successModal');

    if (!modalElement) {
      return;
    }

    const modal = new Modal(modalElement);
    modal.show();
  }

  private carregarPreferencias() {
    this.preferenciasGeneroService
      .preferenciaGeneroControllerFindAll()
      .subscribe(data => {
        this.preferenciasOriginais = data.filter(
          (pref: any) => pref.usuario.id === this.usuarioId
        );

        this.generosSelecionados = this.preferenciasOriginais.map(
          (pref: any) => pref.genero.id
        );
      });
  }

  onReturn() {
    this.location.back();
  }

  onSubmit() {
    this.usuariosService.usuarioControllerUpdate(
      this.usuarioId,
      this.userForm.value as any
    )
    .subscribe(() => {
      if (this.tipoPerfil !== 'aluno') {
        this.abrirModalSucesso();
        return;
      }

      const idsOriginais = this.preferenciasOriginais.map(
        pref => pref.genero.id
      );

      const idsAtuais = this.generosSelecionados;

      const paraCriar = idsAtuais.filter(
        id => !idsOriginais.includes(id)
      );

      const paraRemover = this.preferenciasOriginais.filter(
        pref => !idsAtuais.includes(pref.genero.id)
      );

      const requests = [
        ...paraCriar.map(generoId =>
          this.preferenciasGeneroService
            .preferenciaGeneroControllerCreate({
              usuario_id: this.usuarioId,
              genero_id: generoId,
            })
        ),

        ...paraRemover.map(pref =>
          this.preferenciasGeneroService
            .preferenciaGeneroControllerRemove(pref.id)
        )
      ];

      if (requests.length === 0) {
        this.carregarPreferencias();
        this.abrirModalSucesso();
        return;
      }

      forkJoin(requests).subscribe(() => {
        this.carregarPreferencias();
        this.abrirModalSucesso();
      });
    })
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
