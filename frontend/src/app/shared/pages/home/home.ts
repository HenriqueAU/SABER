import { Component, inject } from '@angular/core';
import { CoreAuthService } from '../../../core/auth/auth-session';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export default class HomeComponent {
 sessionService = inject(CoreAuthService);
 perfil = this.sessionService.perfil
}
