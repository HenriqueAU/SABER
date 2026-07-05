import { HttpClient, HttpContext, HttpContextToken, HttpEvent, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BASE_PATH_DEFAULT, CLIENT_CONTEXT_TOKEN_DEFAULT } from "../tokens";
import { RequestOptions } from "../models";

export interface LivroMaisEmprestado {
  livroId: string;
  titulo: string;
  autor: string;
  totalEmprestimos: number;
}

export interface GeneroProcurado {
  generoId: string;
  nome: string;
  totalEmprestimos: number;
}

export interface MediaLeitura {
  mesAtual: number;
  mesAnterior: number;
  variacaoPercent: number | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly basePath: string = inject(BASE_PATH_DEFAULT);
  private readonly clientContextToken: HttpContextToken<string> = CLIENT_CONTEXT_TOKEN_DEFAULT;

  private createContextWithClientId(existingContext?: HttpContext): HttpContext {
    const context = existingContext || new HttpContext();
    return context.set(this.clientContextToken, 'default');
  }

  livrosMaisEmprestados(observe?: 'body', options?: RequestOptions<'json'>): Observable<LivroMaisEmprestado[]>;
  livrosMaisEmprestados(observe?: 'body' | 'events' | 'response', options?: RequestOptions<any>): Observable<any> {
    const url = `${this.basePath}/dashboard/livros-mais-emprestados`;
    const headers = options?.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options?.headers);
    return this.httpClient.get(url, {
      observe: observe as any,
      headers,
      context: this.createContextWithClientId(options?.context),
    });
  }

  generosMaisProcurados(faixaEtaria?: string, observe?: 'body', options?: RequestOptions<'json'>): Observable<GeneroProcurado[]>;
  generosMaisProcurados(faixaEtaria?: string, observe?: 'body' | 'events' | 'response', options?: RequestOptions<any>): Observable<any> {
    const url = `${this.basePath}/dashboard/generos-mais-procurados`;
    const headers = options?.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options?.headers);
    let params = new HttpParams();
    if (faixaEtaria) {
      params = params.set('faixaEtaria', faixaEtaria);
    }
    return this.httpClient.get(url, {
      observe: observe as any,
      headers,
      params,
      context: this.createContextWithClientId(options?.context),
    });
  }

  mediaLeitura(observe?: 'body', options?: RequestOptions<'json'>): Observable<MediaLeitura>;
  mediaLeitura(observe?: 'body' | 'events' | 'response', options?: RequestOptions<any>): Observable<any> {
    const url = `${this.basePath}/dashboard/media-leitura`;
    const headers = options?.headers instanceof HttpHeaders ? options.headers : new HttpHeaders(options?.headers);
    return this.httpClient.get(url, {
      observe: observe as any,
      headers,
      context: this.createContextWithClientId(options?.context),
    });
  }
}