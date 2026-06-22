import { Injectable } from "@angular/core";
import { TipoPerfil } from "./tipo-perfil.enum";

@Injectable({ providedIn: 'root' })
export class CoreAuthService {
  setToken (valor: string){
    localStorage.setItem('token', valor)
  }
  getToken () {
    return localStorage.getItem('token')
  }
  removeToken () {
    localStorage.removeItem('token')
  }
  isLoggedIn () {
    return !!this.getToken()
  }
  getPerfil(): TipoPerfil | null {
    const token = this.getToken();
    if (!token) return null;
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return payload.perfil
  }
}

