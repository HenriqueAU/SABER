import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_PATH_DEFAULT } from '../../../../client/tokens';

export interface LivroGenero {
  id: string;
  livro: { id: string; titulo?: string };
  genero: { id: string; nome?: string };
}

@Injectable({ providedIn: 'root' })
export class LivroGeneroService {
  private http = inject(HttpClient);
  private basePath = inject(BASE_PATH_DEFAULT);

  vincular(livro_id: string, genero_id: string): Observable<LivroGenero> {
    return this.http.post<LivroGenero>(`${this.basePath}/livro-generos`, { livro_id, genero_id });
  }

  listar(): Observable<LivroGenero[]> {
    return this.http.get<LivroGenero[]>(`${this.basePath}/livro-generos`);
  }

  desvincular(id: string): Observable<any> {
    return this.http.delete(`${this.basePath}/livro-generos/${id}`);
  }
}
