import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  protected preferenciasGeneroService = inject(PreferenciasGeneroService);
  protected generosService = inject(GenerosService);
  private location = inject(Location);

  usuarioId!: string;
  usuarioData: any = null;

  tipoPerfil: string | null = null;

  imagens = Array.from({ length: 16 }, (_, i) => i);

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

  ngOnInit(): void {
    this.usuarioId = this.coreAuthService.getId();
    this.tipoPerfil = this.coreAuthService.getPerfil();

    this.usuariosService.usuarioControllerFindOne(this.usuarioId).subscribe(usuario => {
      this.userForm.patchValue(usuario);
    })

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

    this.usuariosService.usuarioControllerUpdate(
      this.usuarioId,
      this.userForm.value as any
    ).subscribe(() => {
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
