import { Component } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { first } from 'rxjs';
import { UsuáriosService } from '../../../../client/services/usuarios.service';
import { Location, CommonModule } from '@angular/common';

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

  constructor(
    private coreAuthService: CoreAuthService,
    protected usuariosService: UsuáriosService,
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
    }
  }

  onReturn() {
    this.location.back();
  }

  onSubmit() {
    this.usuariosService.usuarioControllerUpdate(
      this.usuarioId,
      this.userForm.value as any
    )
    .pipe(first())
    .subscribe()
  }
}
