import { Routes } from '@angular/router';
import { TipoPerfil } from './core/auth/tipo-perfil.enum';
import { authGuard } from './core/auth/auth-guard';
import { rolesGuard } from './core/auth/roles-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./shared/pages/onboarding/onboarding').then(
        (m) => m.Onboarding,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./shared/pages/home/home').then((m) => m.Home),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./shared/pages/perfil/perfil').then((m) => m.Perfil),
    canActivate: [authGuard],
  },
  {
    path: 'alterar-senha',
    loadComponent: () =>
      import('./shared/pages/alterar-senha/alterar-senha').then(
        (m) => m.AlterarSenha,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notificacoes',
    loadComponent: () =>
      import('./shared/pages/notificacoes/notificacoes').then(
        (m) => m.Notificacoes,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'livros',
    loadComponent: () =>
      import('./features/livro/livro').then((m) => m.Livro),
    canActivate: [authGuard],
  },
  {
    path: 'livros/:id',
    loadComponent: () =>
      import('./features/livro/livro').then((m) => m.Livro),
    canActivate: [authGuard],
  },
  {
    path: 'primeiro-acesso',
    loadComponent: () =>
      import('./features/usuario/primeiro-acesso/primeiro-acesso').then(
        (m) => m.PrimeiroAcesso,
      ),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.ALUNO] },
  },
  {
    path: 'instituicao',
    loadComponent: () =>
      import('./features/instituicao/instituicao').then(
        (m) => m.Instituicao,
      ),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.GESTOR] },
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./features/usuario/usuario').then((m) => m.Usuario),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.GESTOR] },
  },
  {
    path: 'emprestimo',
    loadComponent: () =>
      import('./features/emprestimo/emprestimo').then(
        (m) => m.Emprestimo,
      ),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.BIBLIOTECARIO] },
  },
  {
    path: 'clubes',
    loadComponent: () =>
      import('./features/clube_livro/clube-livro').then(
        (m) => m.ClubeLivro,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'clubes/:id',
    loadComponent: () =>
      import('./features/clube_livro/clube-livro').then(
        (m) => m.ClubeLivro,
      ),
    canActivate: [authGuard],
  },
];
