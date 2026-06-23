import { inject, Injectable, signal } from "@angular/core";
import { TipoPerfil } from "./tipo-perfil.enum";
import { AuthService } from "../../../client/services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class CoreAuthService {
  setToken (valor: string){
    localStorage.setItem('token', valor);
  }
  getToken () {
    return localStorage.getItem('token');
  }
  removeToken () {
    localStorage.removeItem('token');
  }
  private decodeToken() {
    const token = this.getToken();
    if (!token) return null;
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }
  isLoggedIn () {
      return !!this.getToken();
  }
  getPerfil(): TipoPerfil | null {
    const payload = this.decodeToken();
    if(!payload) return null;
    return payload.perfil;
  }
  getId() {
    const payload = this.decodeToken();
    if(!payload) return null;
    return payload.id
  }

  getInstituicao() {
    const payload = this.decodeToken();
    if(!payload) return null;
    return payload.instituicao
  }

  perfil = signal<TipoPerfil | null>(this.getPerfil())
  estaLogado = signal(this.isLoggedIn())
}
