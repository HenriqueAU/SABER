import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExemplaresService } from '../../../../client/services/exemplares.service';
import { CreateExemplarDto } from '../../../../client/models/index';

interface Exemplar extends CreateExemplarDto {
  id: string;
}

@Component({
  selector: 'app-exemplar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exemplar.html',
})
export default class ExemplarComponent implements OnInit, OnChanges{
  @Input() livroId!: string;

  private exemplaresService = inject(ExemplaresService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  exemplares: Exemplar[] = [];
  mostrarForm = false;

  mensagemSucessoExemplar = '';
  erroExemplar = '';

  exemplarParaRemover: string | null = null;
  erroRemocao = '';

  exemplarForm: FormGroup = this.fb.group({
    codigo: ['', Validators.required, Validators.maxLength(50)],
  });

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['livroId']?.currentValue) {
      this.carregarExemplares();
    }
  }

  carregarExemplares() {
    this.exemplaresService.exemplarControllerFindAll().subscribe({
      next: (dados) => {
        this.exemplares = dados.filter(
          (e: any) => e.livro?.id === this.livroId
        );
        this.cdr.detectChanges();
      },
    });
  }
  
  abrirForm() {
    this.exemplarForm.reset({ status: 'disponivel' });
    this.erroExemplar = '';
    this.mensagemSucessoExemplar = '';
    this.mostrarForm = true;
  }

  fecharForm() {
    this.mostrarForm = false;
    this.erroExemplar = '';
    this.mensagemSucessoExemplar = '';
  }

  salvarExemplar() {
    if (this.exemplarForm.invalid) return;
      this.erroExemplar = '';
      this.mensagemSucessoExemplar = '';

      const formValue = {
        ...this.exemplarForm.value,
        livro_id: this.livroId
      };

      this.exemplaresService.exemplarControllerCreate(formValue).subscribe({
        next: () => {
          this.mensagemSucessoExemplar = 'Exemplar cadastrado com sucesso!';
          this.exemplarForm.reset();
          this.carregarExemplares();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erroExemplar = err.error?.message ?? 'Não foi possível cadastrar o exemplar.';
          this.cdr.detectChanges();
        },
      });
  }

  removerExemplar(id: string) {
    this.exemplarParaRemover = id;
    this.erroRemocao = '';
  }

  cancelarRemocao() {
    this.exemplarParaRemover = null;
    this.erroRemocao = '';
  }

  confirmarRemocao() {
    if (!this.exemplarParaRemover) return;

    this.exemplaresService.exemplarControllerRemove(this.exemplarParaRemover).subscribe({
      next: () => {
        this.carregarExemplares();
        this.exemplarParaRemover = null;
        this.erroRemocao = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.erroRemocao = 'Não foi possível remover este exemplar. Pode estar vinculado a um empréstimo.';
        this.cdr.detectChanges();
      }
    });
  }
}
