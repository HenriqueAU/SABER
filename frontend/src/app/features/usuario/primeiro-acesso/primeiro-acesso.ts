import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GenerosService } from '../../../../client/services/generos.service';
import { PreferenciasGeneroService } from '../../../../client/services/preferenciasGenero.service';
import { CoreAuthService } from '../../../core/auth/auth-session';

@Component({selector: 'app-primeiro-acesso',
  templateUrl: './primeiro-acesso.html',
  styleUrl: './primeiro-acesso.scss',
})
export default class PrimeiroAcessoComponent implements OnInit{

  private generosService = inject(GenerosService);
  private preferenciaGeneroService = inject(PreferenciasGeneroService);
  private coreAuthService = inject(CoreAuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  generos: any[] = [];
  generosSelecionados = new Set<string>();
  usuarioId = this.coreAuthService.getId();

  carregando = false;
  salvando = false;
  mensagemErro = '';

  ngOnInit(): void {
    this.carregando = true;
    this.generosService.generoControllerFindAll().subscribe({
      next: (generos) => {
        this.generos = generos;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.mensagemErro = 'Não foi possível carregar os gêneros.';
        this.carregando = false;
        this.cdr.markForCheck();
      },
    });
  }

  toggleGenero(generoId: string): void {
    if (this.generosSelecionados.has(generoId)) {
      this.generosSelecionados.delete(generoId);
    } else {
      this.generosSelecionados.add(generoId);
    }
  }

  onSubmit(): void {
    if (this.generosSelecionados.size === 0) {
      this.mensagemErro = 'Selecione pelo menos um gênero.';
      return;
    }

    this.salvando = true;
    this.mensagemErro = '';

    const chamadas = Array.from(this.generosSelecionados).map((generoId) =>
      this.preferenciaGeneroService.preferenciaGeneroControllerCreate({
        usuario_id: this.usuarioId,
        genero_id: generoId,
      }),
    );

    forkJoin(chamadas).subscribe({
      next: () => {
        this.salvando = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.salvando = false;
        this.mensagemErro = 'Erro ao salvar suas preferências. Tente novamente.';
        this.cdr.markForCheck();
      },
    });
  }
}
