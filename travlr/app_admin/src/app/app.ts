import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

import { AuthenticationService } from './services/authentication';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
 readonly auth = inject(AuthenticationService);
 private router = inject(Router);
 logout() {this.auth.logout(); void this.router.navigate(['/login']);}
}
