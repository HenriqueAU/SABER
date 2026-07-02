import { Component} from '@angular/core';
import ClubeLivroComponent from '../../../../../features/clube_livro/clube-livro';

interface ClubeCard {
  id: string;
  nomeLivro: string;
  capaUrl: string | null;
  membrosAtivos: number;
  exemplaresDisponiveis: number;
  dataEncerramento: Date;
  status: 'ativo' | 'encerrado';
}

@Component({
  selector: 'app-home-professor',
  standalone: true,
  imports: [ClubeLivroComponent],
  template: '<app-clube-livro></app-clube-livro>'
})
export default class HomeProfessorComponent {}