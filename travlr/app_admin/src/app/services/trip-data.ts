import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Trip } from '../models/trip';

@Injectable({ providedIn: 'root' })
export class TripDataService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/trips';
  getTrips() { return this.http.get<Trip[]>(this.url); }
  getTrip(code: string) { return this.http.get<Trip>(`${this.url}/${encodeURIComponent(code)}`); }
  addTrip(trip: Trip) { return this.http.post<Trip>(this.url, trip); }
  updateTrip(trip: Trip) { return this.http.put<Trip>(`${this.url}/${encodeURIComponent(trip.code)}`, trip); }
  deleteTrip(code: string) { return this.http.delete<void>(`${this.url}/${encodeURIComponent(code)}`); }
}
