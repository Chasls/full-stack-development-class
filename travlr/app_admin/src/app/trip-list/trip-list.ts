import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Trip } from '../models/trip';
import { TripDataService } from '../services/trip-data';
import { TripCardComponent } from '../trip-card/trip-card';

@Component({ selector: 'app-trip-list', imports: [RouterLink, TripCardComponent], templateUrl: './trip-list.html' })
export class TripListComponent {
  private readonly data = inject(TripDataService);
  trips = signal<Trip[]>([]);
  loading = signal(true);
  error = signal('');
  message = signal(history.state?.message || '');
  pendingDelete = signal<Trip | null>(null);
  deleting = signal(false);
  constructor() { this.load(); }
  load() {
    this.loading.set(true);
    this.error.set('');
    this.data.getTrips().subscribe({
      next: trips => { this.trips.set(trips); this.loading.set(false); },
      error: () => { this.error.set('Unable to load trips. Check the server and try again.'); this.loading.set(false); }
    });
  }
  deleteConfirmed() {
    const trip = this.pendingDelete();
    if (!trip || this.deleting()) return;
    this.deleting.set(true);
    this.data.deleteTrip(trip.code).subscribe({
      next: () => {
        this.trips.update(trips => trips.filter(item => item.code !== trip.code));
        this.message.set(`${trip.name} deleted.`);
        this.pendingDelete.set(null);
        this.deleting.set(false);
      },
      error: () => { this.error.set('Unable to delete trip. Try again.'); this.deleting.set(false); }
    });
  }
}
