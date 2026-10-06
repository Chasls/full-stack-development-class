import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TripDataService } from './trip-data';
import { Trip } from '../models/trip';

describe('Trip API service', () => {
  let service: TripDataService;
  let http: HttpTestingController;
  const trip: Trip = { code: 'MOCK-REEF', name: 'Mock Reef', length: '5 days', start: '2027-09-10T00:00:00.000Z', resort: 'Lagoon Resort', perPerson: '$999', image: 'reef1.jpg', description: '<p>A mock trip.</p>' };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(TripDataService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('retrieves a collection and a single trip', () => {
    service.getTrips().subscribe(value => expect(value).toEqual([trip]));
    const list = http.expectOne('/api/trips'); expect(list.request.method).toBe('GET'); list.flush([trip]);
    service.getTrip(trip.code).subscribe(value => expect(value).toEqual(trip));
    http.expectOne('/api/trips/MOCK-REEF').flush(trip);
  });
  it('sends POST, PUT, and DELETE to the API', () => {
    service.addTrip(trip).subscribe();
    const post = http.expectOne('/api/trips'); expect(post.request.method).toBe('POST'); expect(post.request.body).toEqual(trip); post.flush(trip);
    service.updateTrip(trip).subscribe();
    const put = http.expectOne('/api/trips/MOCK-REEF'); expect(put.request.method).toBe('PUT'); expect(put.request.body).toEqual(trip); put.flush(trip);
    service.deleteTrip(trip.code).subscribe();
    const del = http.expectOne('/api/trips/MOCK-REEF'); expect(del.request.method).toBe('DELETE'); del.flush(null, { status: 204, statusText: 'No Content' });
  });
  it('exposes server errors to callers', () => {
    let failed = false;
    service.addTrip(trip).subscribe({ error: error => { failed = true; expect(error.status).toBe(409); } });
    http.expectOne('/api/trips').flush({ error: 'Trip code already exists' }, { status: 409, statusText: 'Conflict' });
    expect(failed).toBe(true);
  });
});
