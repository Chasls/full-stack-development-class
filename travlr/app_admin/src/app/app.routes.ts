import { Routes } from '@angular/router';
import { TripListComponent } from './trip-list/trip-list';
import { TripFormComponent } from './trip-form/trip-form';

import { LoginComponent } from './login/login';
import { adminGuard } from './services/auth-security';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: TripListComponent },
  { path: 'trips/new', component: TripFormComponent, canActivate: [adminGuard] },
  { path: 'trips/:code/edit', component: TripFormComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
