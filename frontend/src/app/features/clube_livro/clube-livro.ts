import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ClubesService } from '../../../client/services/clubes.service';
import { PerguntasService } from '../../../client/services/perguntas.service';
import { ItemDaPerguntaService } from '../../../client/services/itemDaPergunta.service';
import { RespostasDoMembroService } from '../../../client/services/respostasDoMembro.service';
import { CoreAuthService } from '../../core/auth/auth-session';
import { TipoPerfil } from '../../core/auth/tipo-perfil.enum';

@Component({
  selector: 'app-clube-livro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clube-livro.html',
  styleUrls: ['./clube-livro.css']
})
export default class ClubeLivroComponent implements OnInit {
  modoListagem: boolean = true;
  clubes: any[] = [];
  clubeDetalhes: any = null;
  perguntas: any[] = [];
  itensPergunta: any[] = [];
  form!: FormGroup;
  carregando: boolean = true;
  enviando: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  clubeId: string | null = null;
  private membroIdMockado = '11111111-1111-1111-1111-111111111111';

  perfilUsuario: TipoPerfil | null = null;
  TipoPerfilEnum = TipoPerfil;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private clubesService = inject(ClubesService);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemDaPerguntaService);
  private respostasService = inject(RespostasDoMembroService);
  private authService = inject(CoreAuthService);

  ngOnInit(): void {
    this.perfilUsuario = this.authService.getPerfil();
    this.form = this.fb.group({});

    this.route.paramMap.subscribe(params => {
      this.clubeId = params.get('id');
      if (this.clubeId) {
        this.modoListagem = false;
        this.carregarDetalhes();
      } else {
        this.modoListagem = true;
        this.carregarClubes();
      }
    });
  }

  async carregarClubes() {
    this.carregando = true;
    try {
      const res = await firstValueFrom(this.clubesService.clubeControllerFindAll());
      this.clubes = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
    } catch (error) {
      console.error('Erro ao buscar clubes:', error);
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

      const resPerguntas = await firstValueFrom(this.perguntasService.perguntaControllerFindAll());
      this.perguntas = resPerguntas || [];

      const resItens = await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll());
      this.itensPergunta = resItens || [];

      Object.keys(this.form.controls).forEach(key => this.form.removeControl(key));
      if (this.perfilUsuario === this.TipoPerfilEnum.ALUNO) {
        this.perguntas.forEach(pergunta => {
          this.form.addControl(pergunta.id, this.fb.control('', Validators.required));
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do clube:', error);
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

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const respostasFormulario = this.form.value;
    const requisicoes: any[] = []; 

    Object.keys(respostasFormulario).forEach(perguntaId => {
      const itemSelecionadoId = respostasFormulario[perguntaId];
      const payload = {
        membro_id: this.membroIdMockado,
        item_pergunta_id: itemSelecionadoId
      } as any;
      requisicoes.push(firstValueFrom(this.respostasService.respostaMembroControllerCreate(payload)));
    });

    try {
      await Promise.all(requisicoes);
      this.mensagemSucesso = 'Feedback enviado com sucesso! Obrigado.';
      this.form.disable();
    } catch (error) {
      this.mensagemErro = 'Ocorreu um erro ao enviar as suas respostas.';
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }
}