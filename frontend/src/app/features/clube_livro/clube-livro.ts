import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { MembroClubeService } from '../../../client/services/membroClube.service';
import { ClubesService } from '../../../client/services/clubes.service';
import { PerguntasService } from '../../../client/services/perguntas.service';
import { ItemPerguntaService } from '../../../client/services/itemPergunta.service';
import { RespostaMembroService } from '../../../client/services/respostaMembro.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import { TipoPerfil } from '../../core/auth/tipo-perfil.enum';

@Component({
  selector: 'app-clube-livro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clube-livro.html',
  styleUrls: ['./clube-livro.scss']
})
export default class ClubeLivroComponent implements OnInit {
  modoListagem: boolean = true;
  abaAtiva: 'detalhes' | 'avaliacao' | 'feedbacks' = 'detalhes';

  clubes: any[] = [];
  clubeDetalhes: any = null;
  perguntas: any[] = [];
  itensPergunta: any[] = [];
  respostasMembros: any[] = [];
  clubeEncerrado: boolean = false;

  form!: FormGroup;
  carregando: boolean = true;
  enviando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  clubeId: string | null = null;
  
  perfilUsuario: TipoPerfil | null = null;
  TipoPerfilEnum = TipoPerfil;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private clubesService = inject(ClubesService);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemPerguntaService);
  private respostasService = inject(RespostaMembroService);
  private authService = inject(CoreAuthService);
  private membroClubeService = inject(MembroClubeService)

  ngOnInit(): void {
    this.perfilUsuario = this.authService.getPerfil();

    if (this.perfilUsuario === TipoPerfil.PROFESSOR) {
      this.router.navigate(['/home']);
      return;
    }
    
    this.form = this.fb.group({});

    this.route.paramMap.subscribe(params => {
      this.clubeId = params.get('id');
      if (this.clubeId) {
        this.modoListagem = false;
        this.abaAtiva = 'detalhes';
        this.carregarDetalhes();
      } else {
        this.modoListagem = true;
        this.carregarClubes();
      }
    });
  }

  getDiasParaInicio(dataInicio: string | Date): number | null {
    if (!dataInicio) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const inicio = new Date(dataInicio);
    inicio.setHours(0, 0, 0, 0);
    
    const diffTime = inicio.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : null;
  }

  async carregarClubes() {
    this.carregando = true;
    try {
      const res = await firstValueFrom(this.clubesService.clubeControllerFindAll());
      this.clubes = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
    } catch (error) {
      this.mensagemErro = 'Não foi possível carregar a lista de clubes.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  abrirClube(id: string) {
    this.router.navigate(['/clubes', id]);
  }

  voltarParaListagem() {
    this.router.navigate(['/clubes']);
  }

  async carregarDetalhes() {
    this.carregando = true;
    this.mensagemSucesso = '';

    try {
      this.clubeDetalhes = await firstValueFrom(this.clubesService.clubeControllerFindOne(this.clubeId!));

      if (this.clubeDetalhes?.data_fim) {
        const dataFim = new Date(this.clubeDetalhes.data_fim);
        this.clubeEncerrado = new Date() > dataFim;
      } else {
        this.clubeEncerrado = false;
      }

      const resPerguntas = await firstValueFrom(this.perguntasService.perguntaControllerFindAll());
      this.perguntas = resPerguntas || [];

      const resItens = await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll());
      this.itensPergunta = resItens || [];

    } catch (error) {
      this.mensagemErro = 'Não foi possível carregar os detalhes deste clube.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  getItensDaPergunta(perguntaId: string): any[] {
    return this.itensPergunta.filter(item => {
      const relacaoId = item.pergunta?.id || item.pergunta_id || item.pergunta;
      return relacaoId === perguntaId;
    });
  }

  abrirAvaliacao() {
    this.abaAtiva = 'avaliacao';
    this.mensagemSucesso = '';

    Object.keys(this.form.controls).forEach(key => this.form.removeControl(key));
    this.perguntas.forEach(pergunta => {
      this.form.addControl(pergunta.id, this.fb.control('', Validators.required));
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensagemErro = '';

    let idDaInscricao = '';
    try {
      const minhaInscricao = await firstValueFrom(
        this.membroClubeService.membroClubeControllerFindMinhaInscricao(this.clubeId!)
      );
      idDaInscricao = minhaInscricao.id;
    } catch (error) {
      this.mensagemErro = 'Apenas membros matriculados neste clube podem enviar avaliações.';
      this.enviando = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      const respostasFormulario = this.form.value;
      const requisicoes: any[] = []; 

      Object.keys(respostasFormulario).forEach(perguntaId => {
        const payload = {
          membro_id: idDaInscricao,
          item_pergunta_id: respostasFormulario[perguntaId]
        } as any;

        requisicoes.push(this.respostasService.respostaMembroControllerCreate(payload));
      });

      if (requisicoes.length > 0) {
        forkJoin(requisicoes).subscribe({
          next: () => {
            this.mensagemSucesso = 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.';
            this.form.disable();
            this.enviando = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.mensagemErro = 'Ocorreu um erro ao enviar a avaliação.';
            this.enviando = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        this.enviando = false;
        this.cdr.detectChanges();
      }

    } catch (error) {
      this.mensagemErro = 'Ocorreu um erro de comunicação com o servidor.';
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }
}