import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MembroDoClubeService } from '../../../client/services/membroDoClube.service';
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
  abaAtiva: 'detalhes' | 'avaliacao' | 'feedbacks' = 'detalhes';
  
  clubes: any[] = [];
  clubeDetalhes: any = null;
  perguntas: any[] = [];
  itensPergunta: any[] = [];
  respostasMembros: any[] = [];
  clubeEncerrado: boolean = false;
  perguntaSelecionadaId: string | null = null;
  estatisticas: any[] = [];
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
  private membroDoClubeService = inject(MembroDoClubeService);
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
        this.abaAtiva = 'detalhes';
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

    let usuarioIdReal = '';
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        usuarioIdReal = payload.id; 
      }
    } catch (e) {
      console.error('Falha ao decodificar o token', e);
    }

    try {
      const resMembros = await firstValueFrom(this.membroDoClubeService.membroClubeControllerFindAll());
      const listaMembros = Array.isArray(resMembros) ? resMembros : (resMembros as any)?.data || (resMembros as any)?.items || [];

      const minhaInscricao = listaMembros.find((m: any) => 
        (m.usuario?.id === usuarioIdReal || m.usuario_id === usuarioIdReal || m.usuario === usuarioIdReal) &&
        (m.clube?.id === this.clubeId || m.clube_id === this.clubeId || m.clube === this.clubeId)
      );

      if (!minhaInscricao) {
        this.mensagemErro = 'Não foi possível encontrar a sua inscrição neste clube.';
        this.enviando = false;
        this.cdr.detectChanges();
        return;
      }

      const idDaInscricao = minhaInscricao.id;
      const respostasFormulario = this.form.value;
      const requisicoes: any[] = []; 

      Object.keys(respostasFormulario).forEach(perguntaId => {
        const payload = {
          membro_id: idDaInscricao,
          item_pergunta_id: respostasFormulario[perguntaId]
        } as any;
        
        requisicoes.push(firstValueFrom(this.respostasService.respostaMembroControllerCreate(payload)));
      });

      await Promise.all(requisicoes);
      this.mensagemSucesso = 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.';
      this.form.disable();
      
    } catch (error) {
      this.mensagemErro = 'Ocorreu um erro ao processar a avaliação.';
      console.error('Erro de envio:', error);
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }

  async abrirFeedbacks() {
    this.abaAtiva = 'feedbacks';
    this.perguntaSelecionadaId = null;
    this.carregando = true;

    try {
      const res = await firstValueFrom(this.respostasService.respostaMembroControllerFindAll());
      this.respostasMembros = Array.isArray(res) ? res : (res as any)?.data || (res as any)?.items || [];
    } catch (error) {
      this.mensagemErro = 'Erro ao buscar respostas dos alunos.';
    } finally {
      this.carregando = false;
      this.cdr.detectChanges();
    }
  }

  selecionarPerguntaParaAnalise(perguntaId: string) {
    if (this.perguntaSelecionadaId === perguntaId) {
      this.perguntaSelecionadaId = null;
      return;
    }

    this.perguntaSelecionadaId = perguntaId;
    const itensDestaPergunta = this.getItensDaPergunta(perguntaId);

    this.estatisticas = itensDestaPergunta.map(item => {
      const votos = this.respostasMembros.filter(resposta => {
        const respostaItemId = resposta.itemPergunta?.id 
                            || resposta.item_pergunta?.id 
                            || resposta.item_pergunta_id 
                            || resposta.item_pergunta;
                            
        return respostaItemId === item.id;
      }).length;

      return {
        texto: item.texto,
        quantidade: votos
      };
    });
  }
}