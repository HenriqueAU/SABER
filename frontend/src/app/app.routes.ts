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
        (m) => m.OnboardingComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/pages/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./shared/pages/home/home').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./shared/pages/perfil/perfil').then((m) => m.PerfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'alterar-senha',
    loadComponent: () =>
      import('./shared/pages/alterar-senha/alterar-senha').then(
        (m) => m.AlterarSenhaComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'notificacoes',
    loadComponent: () =>
      import('./shared/pages/notificacoes/notificacoes').then(
        (m) => m.NotificacoesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'livros',
    loadComponent: () =>
      import('./features/livro/livro').then((m) => m.LivroComponent),
    canActivate: [authGuard],
  },
  {
    path: 'livros/:id',
    loadComponent: () =>
      import('./features/livro/livro').then((m) => m.LivroComponent),
    canActivate: [authGuard],
  },
  {
    path: 'primeiro-acesso',
    loadComponent: () =>
      import('./features/usuario/primeiro-acesso/primeiro-acesso').then(
        (m) => m.PrimeiroAcessoComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.ALUNO] },
  },
  {
    path: 'instituicao',
    loadComponent: () =>
      import('./features/instituicao/instituicao').then(
        (m) => m.InstituicaoComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.GESTOR] },
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./features/usuario/usuario').then((m) => m.UsuarioComponent),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.GESTOR] },
  },
  {
    path: 'emprestimo',
    loadComponent: () =>
      import('./features/emprestimo/emprestimo').then(
        (m) => m.EmprestimoComponent,
      ),
    canActivate: [authGuard, rolesGuard],
    data: { roles: [TipoPerfil.BIBLIOTECARIO] },
  },
  {
    path: 'clubes',
    loadComponent: () =>
      import('./features/clube_livro/clube-livro').then(
        (m) => m.ClubeLivroComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'clubes/:id',
    loadComponent: () =>
      import('./features/clube_livro/clube-livro').then(
        (m) => m.ClubeLivroComponent,
      ),
    canActivate: [authGuard],
  },
];
