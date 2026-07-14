import { Component, ElementRef, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';
import { EmprestimosService } from '../../../client/services/emprestimos.service';
import { ExemplaresService } from '../../../client/services/exemplares.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { LivrosService } from '../../../client/services/livros.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../client/services/usuarios.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-emprestimo',
  imports: [AsyncPipe, DatePipe, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './emprestimo.html',
  styleUrl: './emprestimo.scss',
})
export default class EmprestimoComponent implements OnInit {
  private emprestimosService = inject(EmprestimosService);
  private livrosService = inject(LivrosService);
  private exemplaresService = inject(ExemplaresService);
  private usuariosService = inject(UsuariosService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  emprestimoForm = new FormGroup({
    nome_aluno: new FormControl('', {
      validators: [],
    }),

    aluno_id: new FormControl('', {
      validators: [],
    }),

    data_devolucao_esperada: new FormControl(this.getDataPadraoDevolucao(), {
      validators: [],
    }),
  });

  @ViewChild('emprestimoModal')
  emprestimoModalRef!: ElementRef;

  @ViewChild('exemplaresModal')
  exemplaresModalRef!: ElementRef;

  @ViewChild('successModal')
  successModalRef!: ElementRef;

  @ViewChild('errorModal')
  errorModalRef!: ElementRef;

  livros$ = this.livrosService.livroControllerFindAll();
  livroSelecionado: any = null;

  exemplares: any[] = [];
  exemplarSelecionado: any = null;

  alunos: any[] = [];
  alunosFiltrados: any[] = [];
  alunoSelecionado: any = null;

  termoPesquisa = '';

  abaAtiva: 'emprestimo' | 'devolucao' | 'historico' = 'emprestimo';
  emprestimosAtivos: any[] = [];
  emprestimosHistorico: any[] = [];
  enviandoDevolucao: boolean = false;
  mensagemSucessoModal: string = 'Operação realizada com sucesso!';
  mensagemErroModal: string = 'Ocorreu um erro na operação.';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['tab']) {
        this.abaAtiva = params['tab'];
      }
    });
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais() {
    this.exemplaresService.exemplarControllerFindAll().subscribe((data) => {
      this.exemplares = data;
      this.cdr.detectChanges();
    });

    this.usuariosService.usuarioControllerFindAll().subscribe((data) => {
      this.alunos = data.filter((usuario: any) => usuario.perfil === 'aluno');
      this.cdr.detectChanges();
    });
    this.carregarEmprestimosAtivos();
  }

  carregarEmprestimosAtivos() {
    this.emprestimosService.emprestimoControllerFindAll().subscribe({
      next: (data) => {
        this.emprestimosAtivos = data
          .filter((e: any) => !e.data_devolucao_efetiva)
          .sort(
            (a: any, b: any) =>
              new Date(a.data_devolucao_esperada).getTime() -
              new Date(b.data_devolucao_esperada).getTime(),
          );
        this.emprestimosHistorico = data
          .filter((e: any) => e.data_devolucao_efetiva)
          .sort(
            (a: any, b: any) =>
              new Date(b.data_devolucao_efetiva).getTime() -
              new Date(a.data_devolucao_efetiva).getTime(),
          );
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  estaAtrasado(dataEsperada: string | Date): boolean {
    return new Date(dataEsperada) < new Date();
  }

  estaAtrasadoHistorico(emp: any): boolean {
    if (!emp.data_devolucao_esperada || !emp.data_devolucao_efetiva) return false;
    const esperada = new Date(emp.data_devolucao_esperada).setHours(0, 0, 0, 0);
    const efetiva = new Date(emp.data_devolucao_efetiva).setHours(0, 0, 0, 0);
    return efetiva > esperada;
  }

  getNomeAluno(emp: any): string {
    if (emp.usuario?.nome) return emp.usuario.nome;
    const aluno = this.alunos.find((a) => a.id === (emp.usuario?.id || emp.usuario));
    return aluno?.nome || 'Desconhecido';
  }

  getEmailAluno(emp: any): string {
    if (emp.usuario?.email) return emp.usuario.email;
    const aluno = this.alunos.find((a) => a.id === (emp.usuario?.id || emp.usuario));
    return aluno?.email || '';
  }

  getTituloLivro(emp: any): string {
    if (emp.exemplar?.livro?.titulo) return emp.exemplar.livro.titulo;
    const exId = emp.exemplar?.id || emp.exemplar;
    const ex = this.exemplares.find((e) => e.id === exId);
    return ex?.livro?.titulo || 'Livro Desconhecido';
  }

  getCodigoExemplar(emp: any): string {
    if (emp.exemplar?.codigo) return emp.exemplar.codigo;
    const exId = emp.exemplar?.id || emp.exemplar;
    const ex = this.exemplares.find((e) => e.id === exId);
    return ex?.codigo || 'N/A';
  }

  devolverLivro(emprestimo: any) {
    if (this.enviandoDevolucao) return;
    this.enviandoDevolucao = true;

    const exemplarId = emprestimo.exemplar?.id || emprestimo.exemplar;
    const dataDevolucao = new Date().toISOString();

    const requestEmprestimo = this.emprestimosService.emprestimoControllerUpdate(emprestimo.id, {
      data_devolucao_efetiva: dataDevolucao,
    } as any);

    const requestExemplar = this.exemplaresService.exemplarControllerUpdate(exemplarId, {
      status: 'disponivel',
    } as any);

    forkJoin([requestEmprestimo, requestExemplar]).subscribe({
      next: () => {
        this.mensagemSucessoModal = 'Devolução registrada com sucesso!';
        this.abrirModalSucesso();
        const ex = this.exemplares.find((e) => e.id === exemplarId);
        if (ex) ex.status = 'disponivel';

        this.carregarEmprestimosAtivos();
        this.enviandoDevolucao = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErroModal = 'Erro ao registrar devolução. Tente novamente.';
        this.abrirModalErro();
        this.enviandoDevolucao = false;
        this.cdr.detectChanges();
      },
    });
  }

  abrirModalExemplares(livro: any) {
    this.livroSelecionado = livro;

    const modal = new Modal(this.exemplaresModalRef.nativeElement);

    modal.show();
  }

  selecionarExemplar(exemplar: any) {
    this.exemplarSelecionado = exemplar;

    const exemplaresModal = Modal.getInstance(this.exemplaresModalRef.nativeElement);

    exemplaresModal?.hide();

    this.emprestimoForm.patchValue({
      nome_aluno: '',
      aluno_id: '',
      data_devolucao_esperada: this.getDataPadraoDevolucao(),
    });

    this.alunosFiltrados = [];

    const emprestimoModal = new Modal(this.emprestimoModalRef.nativeElement);

    emprestimoModal.show();
  }

  selecionarAluno(aluno: any) {
    this.alunoSelecionado = aluno;

    this.emprestimoForm.patchValue({
      aluno_id: aluno.id,
      nome_aluno: aluno.nome,
    });

    this.alunosFiltrados = [];
  }

  private abrirModalSucesso() {
    const successModalElement = this.successModalRef.nativeElement;

    if (!successModalElement) {
      return;
    }

    const modal = new Modal(successModalElement);
    modal.show();
  }

  private abrirModalErro() {
    const errorModalElement = this.errorModalRef.nativeElement;

    if (!errorModalElement) {
      return;
    }

    const modal = new Modal(errorModalElement);
    modal.show();
  }

  filtrarLivros(livros: any[]) {
    if (!this.termoPesquisa.trim()) {
      return [];
    }

    const termo = this.termoPesquisa.toLowerCase();

    return livros
      .filter(
        (livro: any) =>
          livro.titulo.toLowerCase().includes(termo) || livro.autor.toLowerCase().includes(termo),
      )
      .filter((livro: any) => this.getQtdeDisponiveis(livro.id) > 0);
  }

  filtrarAlunos() {
    const termo = this.emprestimoForm.get('nome_aluno')?.value?.toLowerCase() || '';

    if (!termo) {
      this.alunosFiltrados = [];
      return;
    }

    this.alunosFiltrados = this.alunos.filter((aluno: any) =>
      aluno.nome.toLowerCase().includes(termo),
    );
  }

  getDataPadraoDevolucao(): string {
    const data = new Date();
    data.setDate(data.getDate() + 14);
    return data.toISOString().split('T')[0];
  }

  getExemplaresLivro(livroId: string) {
    return this.exemplares.filter((exemplar) => exemplar.livro.id === livroId);
  }

  getQtdeDisponiveis(livroId: string) {
    return this.getExemplaresLivro(livroId).filter((exemplar) => exemplar.status === 'disponivel')
      .length;
  }

  getStatusExemplar(livroId: string) {
    const exemplares = this.getExemplaresLivro(livroId);

    const qtdeExemplares = exemplares.length;

    if (qtdeExemplares === 0) {
      return 'SEM EXEMPLARES';
    }

    const qtdeDisponiveis = exemplares.filter(
      (exemplar) => exemplar.status === 'disponivel',
    ).length;

    if (qtdeDisponiveis === 0) {
      return 'INDISPONÍVEL';
    }

    return `${qtdeDisponiveis}/${qtdeExemplares} DISPONÍVEIS`;
  }

  getColorStatusExemplar(livroId: string) {
    const exemplares = this.getExemplaresLivro(livroId);

    const qtdeExemplares = exemplares.length;

    if (qtdeExemplares === 0) {
      return 'bg-secondary-subtle text-secondary';
    }

    const qtdeDisponiveis = exemplares.filter(
      (exemplar) => exemplar.status === 'disponivel',
    ).length;

    if (qtdeDisponiveis === 0) {
      return 'bg-danger-subtle text-danger';
    }

    return 'bg-success-subtle text-success';
  }

  onSubmit() {
    if (!this.exemplarSelecionado) {
      return;
    }

    const payload = {
      exemplar_id: this.exemplarSelecionado.id,
      usuario_id: this.emprestimoForm.value.aluno_id,
      data_retirada: new Date(),
      data_devolucao_esperada: this.emprestimoForm.value.data_devolucao_esperada,
    };

    this.emprestimosService.emprestimoControllerCreate(payload as any).subscribe({
      next: () => {
        const emprestimoModal = Modal.getInstance(this.emprestimoModalRef.nativeElement);

        emprestimoModal?.hide();

        this.mensagemSucessoModal = 'Empréstimo realizado com sucesso!';
        this.abrirModalSucesso();
        const ex = this.exemplares.find((e) => e.id === this.exemplarSelecionado.id);
        if (ex) ex.status = 'emprestado';

        this.carregarEmprestimosAtivos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const emprestimoModal = Modal.getInstance(this.emprestimoModalRef.nativeElement);

        emprestimoModal?.hide();

        this.mensagemErroModal = err.error?.message ?? 'Erro ao realizar o empréstimo.';
        this.abrirModalErro();
        this.cdr.detectChanges();
      },
    });
  }
  paginaAtualHistorico = 1;
  itensPorPaginaHistorico = 10;

  get historicoTotalPaginas(): number {
    return Math.ceil(this.emprestimosHistorico.length / this.itensPorPaginaHistorico);
  }

  get historicoPaginas(): number[] {
    return Array.from({ length: this.historicoTotalPaginas }, (_, i) => i + 1);
  }

  get historicoPaginado(): any[] {
    const inicio = (this.paginaAtualHistorico - 1) * this.itensPorPaginaHistorico;
    const fim = inicio + this.itensPorPaginaHistorico;
    return this.emprestimosHistorico.slice(inicio, fim);
  }

  irParaPaginaHistorico(pagina: number): void {
    if (pagina < 1 || pagina > this.historicoTotalPaginas) return;
    this.paginaAtualHistorico = pagina;
  }
}
