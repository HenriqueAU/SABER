import { Routes } from '@angular/router';
import { TipoPerfil } from './core/auth/tipo-perfil.enum';
import { authGuard } from './core/auth/auth.guard';
import { rolesGuard } from './core/auth/roles.guard';

export const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full',
    },
  {
    path: 'login',
    loadComponent: () => import('./shared/pages/login/login.component'),
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./shared/pages/onboarding/onboarding.component'),
  },
  {
    path: 'home',
    loadComponent: () => import('./shared/pages/home/home.component'),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./shared/pages/perfil/perfil.component'),
    canActivate: [authGuard],
  },
  {
    path: 'alterar-senha',
    loadComponent: () => import('./shared/pages/alterar-senha/alterar-senha.component'),
    canActivate: [authGuard],
  },
  {
    path: 'notificacoes',
    loadComponent: () => import('./shared/pages/notificacoes/notificacoes.component'),
    canActivate: [authGuard],
  },
  {
    path: 'livros',
    loadComponent: () => import('./features/livro/livro.component'),
    canActivate: [authGuard],

  },
  {
    path: 'livros/:id',
    loadComponent: () => import('./features/livro/livro.component'),
    canActivate: [authGuard],
  },
  {
    path: 'primeiro-acesso',
    loadComponent: () => import('./features/usuario/primeiro-acesso/primeiro-acesso.component'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.ALUNO]}
  },
  {
    path: 'instituicao',
    loadComponent: () => import('./features/instituicao/instituicao.component'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.GESTOR]}
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/usuario.component'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.GESTOR]}
  },
  {
    path: 'emprestimo',
    loadComponent: () => import('./features/emprestimo/emprestimo.component'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.BIBLIOTECARIO]}
  },
  {
    path: 'clubes',
    loadComponent: () => import('./features/clube_livro/clube-livro.component'),
    canActivate: [authGuard],
  },
  {
    path: 'clubes/:id',
    loadComponent: () => import('./features/clube_livro/clube-livro.component'),
    canActivate: [authGuard],
  },
];
