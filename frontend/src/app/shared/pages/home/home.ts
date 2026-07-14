import { Component, inject } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';
import HomeGestorComponent from './dashboards/gestor/home-gestor';
import HomeBibliotecarioComponent from './dashboards/bibliotecario/home-bibliotecario';
import HomeProfessorComponent from './dashboards/professor/home-professor';
import HomeAlunoComponent from './dashboards/aluno/home-aluno';

@Component({
  selector: 'app-home',
  imports: [HomeGestorComponent, HomeBibliotecarioComponent, HomeProfessorComponent, HomeAlunoComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class HomeComponent {
 coreAuthService = inject(CoreAuthService);
 perfil = this.coreAuthService.perfil
}
