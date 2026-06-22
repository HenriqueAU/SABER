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
  
  exemplarForm: FormGroup = this.fb.group({
    codigo: ['', Validators.required],
    status: ['disponivel', Validators.required]
  });

  ngOnInit() {

}

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
    error: (err) => console.error('Erro ao carregar exemplares', err)
  });
}
  abrirForm() {
    this.exemplarForm.reset({ status: 'disponivel' });
    this.mostrarForm = true;
  }

  fecharForm() {
    this.mostrarForm = false;
  }

  salvarExemplar() {
  if (this.exemplarForm.invalid) return;

  console.log('livroId recebido:', this.livroId);

  const formValue = {
    ...this.exemplarForm.value,
    livro_id: this.livroId
  };

  console.log('Payload enviado:', formValue);

  this.exemplaresService.exemplarControllerCreate(formValue).subscribe({
    next: () => {
      console.log('Exemplar criado com sucesso');

      this.fecharForm();
      this.carregarExemplares();
    },
    error: (err) => {
      console.error('Erro ao criar exemplar', err);

      if (err.error) {
        console.log('Resposta do backend:', err.error);
      }
    }
  });
}

  removerExemplar(id: string) {
    if(confirm('Tem certeza que deseja remover este exemplar?')) {
      this.exemplaresService.exemplarControllerRemove(id).subscribe({
        next: () => this.carregarExemplares(),
        error: (err) => console.error('Erro ao remover exemplar', err)
      });
    }
  }
}
