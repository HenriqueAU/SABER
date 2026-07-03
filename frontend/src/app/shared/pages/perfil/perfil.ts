import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { UsuariosService } from '../../../../client/services/usuarios.service';
import { CommonModule, Location } from '@angular/common';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-perfil',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export default class PerfilComponent implements OnInit{
  private coreAuthService = inject(CoreAuthService);
  protected usuariosService = inject(UsuariosService);
  protected router = inject(Router);
  private location = inject(Location);

  usuarioId!: string;
  usuarioData: any = null;

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

  ngOnInit(): void {
    const token = this.coreAuthService.getToken();
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      this.usuarioId = payload.id;

      this.carregarDadosUsuario();
    }
  }

  carregarDadosUsuario() {
    this.usuariosService.usuarioControllerFindOne(this.usuarioId).subscribe(data => {
      this.usuarioData = data;
      this.userForm.patchValue({
        nome: data.nome,
        email: data.email,
      });
    });
  }

  cancelarEdicao() {
    this.location.back();
  }

  onSubmit() {
    if (this.userForm.invalid) return;

    this.usuariosService.usuarioControllerUpdate(this.usuarioId, this.userForm.value as any).subscribe({
      next: () => {
        this.abrirModalSucesso();
      }
    });
  }

  abrirModalSucesso() {
    const modal = new Modal(this.successModalRef.nativeElement);
    modal.show();
  }

  onReturn() {
    const modal = Modal.getInstance(this.successModalRef.nativeElement);
    modal?.hide();
    this.location.back();
  }
}
