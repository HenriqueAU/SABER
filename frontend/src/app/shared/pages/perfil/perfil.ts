import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { forkJoin } from 'rxjs';
import { UsuariosService } from '../../../../client/services/usuarios.service';
import { Location, CommonModule } from '@angular/common';
import { PreferenciasGeneroService } from '../../../../client/services/preferenciasGenero.service';
import { GenerosService } from '../../../../client/services/generos.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export default class PerfilComponent implements OnInit{
  private coreAuthService = inject(CoreAuthService);
  protected usuariosService = inject(UsuariosService);
  protected preferenciasGeneroService = inject(PreferenciasGeneroService);
  protected generosService = inject(GenerosService);
  protected router = inject(Router);
  private location = inject(Location);

  usuarioId!: string;

  tipoPerfil: string | null = null;

  userForm = new FormGroup({
    nome: new FormControl('', {
      validators: []
    }),

    email: new FormControl({ value: '', disabled: true }),

    foto_perfil: new FormControl('', {
      validators: []
    }),
  });

  @ViewChild('successModal')
  successModalRef!: ElementRef;

  generos$? = this.generosService.generoControllerFindAll();

  preferenciasOriginais: any[] = [];

  generosSelecionados: string[] = [];

  ngOnInit() {
    this.usuarioId = this.coreAuthService.getId();
    this.tipoPerfil = this.coreAuthService.getPerfil();

    this.usuariosService.usuarioControllerFindOne(this.usuarioId).subscribe(usuario => {
      this.userForm.patchValue(usuario);
    })

    if (this.tipoPerfil !== 'aluno') {
      return;
    }

    this.preferenciasGeneroService
      .preferenciaGeneroControllerFindAll()
      .subscribe(data => {
        this.preferenciasOriginais = data;

        this.generosSelecionados = this.preferenciasOriginais.map(
          (pref: any) => pref.genero.id
        );
      });
  }

  private abrirModalSucesso() {
    const successModalElement = this.successModalRef.nativeElement;

    if (!successModalElement) {
      return;
    }

    const modal = new Modal(successModalElement);
    modal.show();
  }

  private carregarPreferencias() {
    this.preferenciasGeneroService
      .preferenciaGeneroControllerFindAll()
      .subscribe(data => {
        this.preferenciasOriginais = data;

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
