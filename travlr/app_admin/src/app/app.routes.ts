import { Routes } from '@angular/router';
import { TripListComponent } from './trip-list/trip-list';
import { TripFormComponent } from './trip-form/trip-form';

export const routes: Routes = [
  { path: '', component: TripListComponent },
  { path: 'trips/new', component: TripFormComponent },
  { path: 'trips/:code/edit', component: TripFormComponent },
  { path: '**', redirectTo: '' }
];
