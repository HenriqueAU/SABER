import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-success-modal',
  imports: [],
  templateUrl: './success-modal.html',
  styleUrl: './success-modal.scss',
})
export class SuccessModal {
  @Input() mensagem = '';
}
