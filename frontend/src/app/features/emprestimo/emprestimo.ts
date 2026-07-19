import { Component, ElementRef, OnInit, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Modal from 'bootstrap/js/dist/modal';
import { EmprestimosService } from '../../../client/services/emprestimos.service';
import { ExemplaresService } from '../../../client/services/exemplares.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { LivrosService } from '../../../client/services/livros.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../client/services/usuarios.service';
import { forkJoin } from 'rxjs';
import { SuccessModal } from '../../shared/components/success-modal/success-modal';
import { ErrorModal } from '../../shared/components/error-modal/error-modal';

@Component({
  selector: 'app-emprestimo',
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    SuccessModal,
    ErrorModal,
  ],
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
    nome_aluno: new FormControl('', { validators: [] }),
    aluno_id: new FormControl('', { validators: [Validators.required] }),
    data_devolucao_esperada: new FormControl(this.getDataPadraoDevolucao(), {
      validators: [Validators.required],
    }),
  });

  @ViewChild('emprestimoModal') emprestimoModalRef!: ElementRef;
  @ViewChild('exemplaresModal') exemplaresModalRef!: ElementRef;
  @ViewChild('successModal') successModalRef!: ElementRef;
  @ViewChild('errorModal') errorModalRef!: ElementRef;
  @ViewChild('devolucaoModal') DevolucaoModalRef!: ElementRef; // Novo Modal

  livros$ = this.livrosService.livroControllerFindAll();
  livroSelecionado: any = null;

  exemplares: any[] = [];
  exemplarSelecionado: any = null;

  alunos: any[] = [];
  alunosFiltrados: any[] = [];
  alunoSelecionado: any = null;

  termoPesquisa = '';
  termoPesquisaDevolucao = '';

  abaAtiva: 'emprestimo' | 'devolucao' | 'historico' = 'emprestimo';
  emprestimosAtivos: any[] = [];
  emprestimosHistorico: any[] = [];
  enviandoDevolucao: boolean = false;
  mensagemSucessoModal: string = 'Operação realizada com sucesso!';
  mensagemErroModal: string = 'Ocorreu um erro na operação.';

  paginaAtualDevolucao = 1;
  itensPorPaginaDevolucao = 30;
  emprestimoSelecionadoDevolucao: any = null;

  paginaAtualHistorico = 1;
  itensPorPaginaHistorico = 10;

  filtroAtivo: 'todos' | 'atrasados' | 'hoje' = 'todos';
  filtroHistorico: 'todos' | 'retirada' | 'limite' | 'devolucao' = 'todos';
  filtroDataHistorico: string = '';

  getIniciais(emp: any): string {
    const nome = this.getNomeAluno(emp);
    return nome
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }

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
          .filter(
            (e: any) =>
              !e.data_devolucao_efetiva && e.status !== 'perdido' && e.status !== 'danificado',
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.data_devolucao_esperada).getTime() -
              new Date(b.data_devolucao_esperada).getTime(),
          );

        this.emprestimosHistorico = data
          .filter(
            (e: any) =>
              e.data_devolucao_efetiva || e.status === 'perdido' || e.status === 'danificado',
          )
          .sort(
            (a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          );

        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }
  marcarComoPerdido(emprestimo: any) {
    if (!emprestimo) return;
    this.enviandoDevolucao = true;
    const modalInstance = Modal.getInstance(this.DevolucaoModalRef.nativeElement);
    modalInstance?.hide();

    this.emprestimosService.emprestimoControllerMarcarPerdido(emprestimo.id).subscribe({
      next: () => {
        this.exemplares = this.exemplares.filter(
          (e) => e.id !== (emprestimo.exemplar?.id || emprestimo.exemplar),
        );
        this.mensagemSucessoModal = 'Livro marcado como perdido e removido do acervo!';
        this.abrirModalSucesso();
        this.carregarEmprestimosAtivos();
        this.enviandoDevolucao = false;
        this.emprestimoSelecionadoDevolucao = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErroModal = 'Erro ao registrar. Tente novamente.';
        this.abrirModalErro();
        this.enviandoDevolucao = false;
        this.cdr.detectChanges();
      },
    });
  }

  marcarComoDanificado(emprestimo: any) {
    if (!emprestimo) return;
    this.enviandoDevolucao = true;
    const modalInstance = Modal.getInstance(this.DevolucaoModalRef.nativeElement);
    modalInstance?.hide();

    this.emprestimosService.emprestimoControllerMarcarDanificado(emprestimo.id).subscribe({
      next: () => {
        const exId = emprestimo.exemplar?.id || emprestimo.exemplar;
        const ex = this.exemplares.find((e) => e.id === exId);
        if (ex) ex.status = 'danificado';

        this.mensagemSucessoModal = 'Livro marcado como danificado!';
        this.abrirModalSucesso();
        this.carregarEmprestimosAtivos();
        this.enviandoDevolucao = false;
        this.emprestimoSelecionadoDevolucao = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensagemErroModal = 'Erro ao registrar. Tente novamente.';
        this.abrirModalErro();
        this.enviandoDevolucao = false;
        this.cdr.detectChanges();
      },
    });
  }

  get devolucoesFiltradas(): any[] {
    let lista = this.emprestimosAtivos;

    if (this.filtroAtivo === 'atrasados') {
      lista = lista.filter((emp) => this.estaAtrasado(emp.data_devolucao_esperada));
    } else if (this.filtroAtivo === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0];
      lista = lista.filter(
        (emp) => new Date(emp.data_devolucao_esperada).toISOString().split('T')[0] === hoje,
      );
    }

    if (this.termoPesquisaDevolucao.trim()) {
      const termo = this.termoPesquisaDevolucao.toLowerCase();
      lista = lista.filter((emp) => this.getNomeAluno(emp).toLowerCase().includes(termo));
    }

    return lista;
  }

  get devolucaoTotalPaginas(): number {
    return Math.ceil(this.devolucoesFiltradas.length / this.itensPorPaginaDevolucao);
  }

  get devolucaoPaginas(): number[] {
    return Array.from({ length: this.devolucaoTotalPaginas }, (_, i) => i + 1);
  }

  get devolucaoPaginada(): any[] {
    const inicio = (this.paginaAtualDevolucao - 1) * this.itensPorPaginaDevolucao;
    const fim = inicio + this.itensPorPaginaDevolucao;
    return this.devolucoesFiltradas.slice(inicio, fim);
  }

  irParaPaginaDevolucao(pagina: number): void {
    if (pagina < 1 || pagina > this.devolucaoTotalPaginas) return;
    this.paginaAtualDevolucao = pagina;
  }

  abrirModalDevolucao(emprestimo: any) {
    this.emprestimoSelecionadoDevolucao = emprestimo;
    const modal = new Modal(this.DevolucaoModalRef.nativeElement);
    modal.show();
  }

  getDiasAtraso(dataEsperada: string | Date): number {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const esperada = new Date(dataEsperada);
    esperada.setHours(0, 0, 0, 0);
    const diferenca = hoje.getTime() - esperada.getTime();
    const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
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

  getMatriculaAluno(emp: any): string {
    const aluno = this.alunos.find((a) => a.id === (emp.usuario?.id || emp.usuario));
    return aluno?.matricula || aluno?.id?.substring(0, 9) || '2026001944';
  }

  getContatoAluno(emp: any): string {
    const aluno = this.alunos.find((a) => a.id === (emp.usuario?.id || emp.usuario));
    return aluno?.contato || aluno?.telefone || '(11) 98877-6655';
  }

  getTituloLivro(emp: any): string {
    if (emp.exemplar?.livro?.titulo) return emp.exemplar.livro.titulo;
    const exId = emp.exemplar?.id || emp.exemplar;
    const ex = this.exemplares.find((e) => e.id === exId);
    return ex?.livro?.titulo || 'Livro Desconhecido';
  }

  getAutorLivro(emp: any): string {
    if (emp.exemplar?.livro?.autor) return emp.exemplar.livro.autor;
    const exId = emp.exemplar?.id || emp.exemplar;
    const ex = this.exemplares.find((e) => e.id === exId);
    return ex?.livro?.autor || 'Autor Desconhecido';
  }

  getIsbnLivro(emp: any): string {
    if (emp.exemplar?.livro?.isbn) return emp.exemplar.livro.isbn;
    const exId = emp.exemplar?.id || emp.exemplar;
    const ex = this.exemplares.find((e) => e.id === exId);
    return ex?.livro?.isbn || 'Não informado';
  }

  getCapaLivro(emp: any): string {
    if (emp.exemplar?.livro?.capa_url) return emp.exemplar.livro.capa_url;
    const exId = emp.exemplar?.id || emp.exemplar;
    const ex = this.exemplares.find((e) => e.id === exId);
    return ex?.livro?.capa_url || '';
  }

  getCodigoExemplar(emp: any): string {
    if (emp.exemplar?.codigo) return emp.exemplar.codigo;
    const exId = emp.exemplar?.id || emp.exemplar;
    const ex = this.exemplares.find((e) => e.id === exId);
    return ex?.codigo || 'N/A';
  }
  getFimPagina(): number {
    return Math.min(
      this.paginaAtualDevolucao * this.itensPorPaginaDevolucao,
      this.devolucoesFiltradas.length,
    );
  }

  devolverLivro(
    emprestimo: any,
    novoStatus: 'disponivel' | 'perdido' | 'danificado' = 'disponivel',
  ) {
    if (this.enviandoDevolucao || !emprestimo) return;
    this.enviandoDevolucao = true;

    const modalInstance = Modal.getInstance(this.DevolucaoModalRef.nativeElement);
    modalInstance?.hide();

    const GlenId = emprestimo.exemplar?.id || emprestimo.exemplar;
    const dataDevolucao = new Date().toISOString();

    const requestEmprestimo = this.emprestimosService.emprestimoControllerUpdate(emprestimo.id, {
      data_devolucao_efetiva: dataDevolucao,
    } as any);

    const requestExemplar =
      novoStatus === 'perdido'
        ? this.exemplaresService.exemplarControllerRemove(GlenId)
        : this.exemplaresService.exemplarControllerUpdate(GlenId, {
            status: novoStatus,
          } as any);

    forkJoin([requestEmprestimo, requestExemplar]).subscribe({
      next: () => {
        const mensagens = {
          disponivel: 'Devolução registrada com sucesso!',
          danificado: 'Devolução registrada. Exemplar marcado como danificado.',
          perdido: 'Devolução registrada. Exemplar marcado como perdido e removido do acervo.',
        };
        this.mensagemSucessoModal = mensagens[novoStatus];
        this.abrirModalSucesso();

        const ex = this.exemplares.find((e) => e.id === GlenId);
        if (ex) {
          if (novoStatus === 'perdido') {
            this.exemplares = this.exemplares.filter((e) => e.id !== GlenId);
          } else {
            ex.status = novoStatus;
          }
        }

        this.carregarEmprestimosAtivos();
        this.enviandoDevolucao = false;
        this.emprestimoSelecionadoDevolucao = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.mensagemErroModal =
          err.error?.message ?? 'Erro ao registrar devolução. Tente novamente.';
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
    const modal = new Modal(this.successModalRef.nativeElement);
    modal.show();
  }

  private abrirModalErro() {
    const modal = new Modal(this.errorModalRef.nativeElement);
    modal.show();
  }

  filtrarLivros(livros: any[]) {
    if (!this.termoPesquisa.trim()) return [];
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
    if (qtdeExemplares === 0) return 'SEM EXEMPLARES';
    const qtdeDisponiveis = exemplares.filter(
      (exemplar) => exemplar.status === 'disponivel',
    ).length;
    if (qtdeDisponiveis === 0) return 'INDISPONÍVEL';
    return `${qtdeDisponiveis}/${qtdeExemplares} DISPONÍVEIS`;
  }

  getColorStatusExemplar(livroId: string) {
    const exemplares = this.getExemplaresLivro(livroId);

    const qtdeExemplares = exemplares.length;
    if (qtdeExemplares === 0) return 'bg-secondary-subtle text-secondary';
    const qtdeDisponiveis = exemplares.filter(
      (exemplar) => exemplar.status === 'disponivel',
    ).length;
    if (qtdeDisponiveis === 0) return 'bg-danger-subtle text-danger';
    return 'bg-success-subtle text-success';
  }

  onSubmit() {
    if (!this.exemplarSelecionado) return;
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

  termoPesquisaHistorico = '';

  get historicoFiltrado(): any[] {
    let lista = this.emprestimosHistorico;

    if (this.filtroHistorico === 'retirada') {
      lista = [...lista].sort(
        (a, b) => new Date(b.data_retirada).getTime() - new Date(a.data_retirada).getTime(),
      );
    } else if (this.filtroHistorico === 'limite') {
      lista = [...lista].sort(
        (a, b) =>
          new Date(b.data_devolucao_esperada).getTime() -
          new Date(a.data_devolucao_esperada).getTime(),
      );
    } else if (this.filtroHistorico === 'devolucao') {
      lista = [...lista].sort(
        (a, b) =>
          new Date(b.data_devolucao_efetiva ?? b.updated_at).getTime() -
          new Date(a.data_devolucao_efetiva ?? a.updated_at).getTime(),
      );
    }

    if (this.termoPesquisaHistorico.trim()) {
      const termo = this.termoPesquisaHistorico.toLowerCase();
      lista = lista.filter((emp) => this.getNomeAluno(emp).toLowerCase().includes(termo));
    }

    if (this.filtroDataHistorico) {
      const dataSelecionada = this.filtroDataHistorico;
      lista = lista.filter((emp) => {
        const campoData =
          this.filtroHistorico === 'retirada'
            ? emp.data_retirada
            : this.filtroHistorico === 'limite'
              ? emp.data_devolucao_esperada
              : this.filtroHistorico === 'devolucao'
                ? (emp.data_devolucao_efetiva ?? emp.updated_at)
                : emp.data_retirada;
        return campoData?.split('T')[0] === dataSelecionada;
      });
    }

    return lista;
  }

  get historicoTotalPaginas(): number {
    return Math.ceil(this.historicoFiltrado.length / this.itensPorPaginaHistorico);
  }

  get historicoPaginas(): number[] {
    return Array.from({ length: this.historicoTotalPaginas }, (_, i) => i + 1);
  }

  get historicoPaginado(): any[] {
    const inicio = (this.paginaAtualHistorico - 1) * this.itensPorPaginaHistorico;
    return this.historicoFiltrado.slice(inicio, inicio + this.itensPorPaginaHistorico);
  }

  getFimPaginaHistorico(): number {
    return Math.min(
      this.paginaAtualHistorico * this.itensPorPaginaHistorico,
      this.historicoFiltrado.length,
    );
  }

  irParaPaginaHistorico(pagina: number): void {
    if (pagina < 1 || pagina > this.historicoTotalPaginas) return;
    this.paginaAtualHistorico = pagina;
  }
}
