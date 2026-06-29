import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './home-professor.html',
})
export default class HomeProfessorComponent implements OnInit {
  clubes = signal<ClubeCard[]>([]);

  ngOnInit(): void {
    this.clubes.set(this.getMockData());
  }

  vagasDisponiveis(clube: ClubeCard): number {
    return Math.max(0, clube.exemplaresDisponiveis - clube.membrosAtivos);
  }

  private getMockData(): ClubeCard[] {
    return [
      {
        id: '1',
        nomeLivro: 'O Senhor dos Anéis',
        capaUrl: null,
        membrosAtivos: 8,
        exemplaresDisponiveis: 10,
        dataEncerramento: new Date('2025-08-15'),
        status: 'ativo',
      },
      {
        id: '2',
        nomeLivro: 'Dom Casmurro',
        capaUrl: null,
        membrosAtivos: 5,
        exemplaresDisponiveis: 5,
        dataEncerramento: new Date('2025-07-30'),
        status: 'ativo',
      },
      {
        id: '3',
        nomeLivro: '1984',
        capaUrl: null,
        membrosAtivos: 6,
        exemplaresDisponiveis: 6,
        dataEncerramento: new Date('2025-05-01'),
        status: 'encerrado',
      },
    ];
  }
}
