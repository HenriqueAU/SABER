import { Routes } from '@angular/router';
import { TipoPerfil } from './core/auth/tipo-perfil.enum';
import { authGuard } from './core/auth/auth-guard';
import { rolesGuard } from './core/auth/roles-guard';

export const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full',
    },
  {
    path: 'login',
    loadComponent: () => import('./shared/pages/login/login'),
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./shared/pages/onboarding/onboarding'),
  },
  {
    path: 'home',
    loadComponent: () => import('./shared/pages/home/home'),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () => import('./shared/pages/perfil/perfil'),
    canActivate: [authGuard],
  },
  {
    path: 'alterar-senha',
    loadComponent: () => import('./shared/pages/alterar-senha/alterar-senha'),
    canActivate: [authGuard],
  },
  {
    path: 'notificacoes',
    loadComponent: () => import('./shared/pages/notificacoes/notificacoes'),
    canActivate: [authGuard],
  },
  {
    path: 'livros',
    loadComponent: () => import('./features/livro/livro'),
    canActivate: [authGuard],

  },
  {
    path: 'livros/:id',
    loadComponent: () => import('./features/livro/livro'),
    canActivate: [authGuard],
  },
  {
    path: 'primeiro-acesso',
    loadComponent: () => import('./features/usuario/primeiro-acesso/primeiro-acesso'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.ALUNO]}
  },
  {
    path: 'instituicao',
    loadComponent: () => import('./features/instituicao/instituicao'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.GESTOR]}
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/usuario'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.GESTOR]}
  },
  {
    path: 'emprestimo',
    loadComponent: () => import('./features/emprestimo/emprestimo'),
    canActivate: [authGuard, rolesGuard],
    data: {roles: [TipoPerfil.BIBLIOTECARIO]}
  },
  {
    path: 'clubes',
    loadComponent: () => import('./features/clube_livro/clube-livro'),
    canActivate: [authGuard],
  },
  {
    path: 'clubes/:id',
    loadComponent: () => import('./features/clube_livro/clube-livro'),
    canActivate: [authGuard],
  },
];
