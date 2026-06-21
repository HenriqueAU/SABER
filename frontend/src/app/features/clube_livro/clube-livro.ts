import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);
  private perguntasService = inject(PerguntasService);
  private itemPerguntaService = inject(ItemDaPerguntaService);
  private respostasService = inject(RespostasDoMembroService);
  private authService = inject(CoreAuthService);

  ngOnInit(): void {
    this.perfilUsuario = this.authService.getPerfil();
    this.form = this.fb.group({});
    this.clubeId = this.route.snapshot.paramMap.get('id');
    this.carregarDados();
  }

  async carregarDados() {
    console.log('[DEBUG] 1. Iniciando busca...');
    try {
      const resPerguntas = await firstValueFrom(this.perguntasService.perguntaControllerFindAll());
      console.log('[DEBUG] Sucesso Perguntas:', resPerguntas);
      this.perguntas = resPerguntas || [];

      const resItens = await firstValueFrom(this.itemPerguntaService.itemPerguntaControllerFindAll());
      console.log('[DEBUG] Sucesso Itens:', resItens);
      this.itensPergunta = resItens || [];

      if (this.perfilUsuario === this.TipoPerfilEnum.ALUNO) {
        this.perguntas.forEach(pergunta => {
          this.form.addControl(pergunta.id, this.fb.control('', Validators.required));
        });
      }
      
    } catch (error) {
      console.error('[DEBUG] ERRO NA API CAPTURADO:', error);
      this.mensagemErro = 'Não foi possível carregar as perguntas (Erro de comunicação).';
    } finally {
      console.log('[DEBUG] 7. Desligando loading...');
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
      console.log('[DEBUG] A enviar as respostas para o backend...');
      await Promise.all(requisicoes);

      this.mensagemSucesso = 'Questionário enviado com sucesso! Obrigado pelo seu feedback.';
      this.form.disable();
    } catch (error) {
      console.error('[DEBUG] ERRO AO ENVIAR RESPOSTAS:', error);
      this.mensagemErro = 'Ocorreu um erro ao enviar as suas respostas. (Provavelmente o membro mockado não existe no BD)';
    } finally {
      console.log('[DEBUG] Finalizando o envio...');
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }
}