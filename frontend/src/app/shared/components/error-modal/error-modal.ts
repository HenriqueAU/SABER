import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-modal',
  imports: [],
  templateUrl: './error-modal.html',
  styleUrl: './error-modal.scss',
})
export class ErrorModal {
  @Input() mensagem = '';
}
