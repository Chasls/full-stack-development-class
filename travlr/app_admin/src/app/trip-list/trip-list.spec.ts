import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TripListComponent } from './trip-list';
import { TripDataService } from '../services/trip-data';

const trip = { code: 'MOCK-REEF', name: 'Mock Reef', length: '5 days', start: '2027-09-10T00:00:00.000Z', resort: 'Lagoon Resort', perPerson: '$999', image: 'reef1.jpg', description: '<p>A mock trip.</p>' };
describe('Trip components with mock data', () => {
  const service = { getTrips: vi.fn(), deleteTrip: vi.fn() };
  beforeEach(() => {
    service.getTrips.mockReturnValue(of([trip]));
    service.deleteTrip.mockReturnValue(of(undefined));
    TestBed.configureTestingModule({ imports: [TripListComponent], providers: [provideRouter([]), { provide: TripDataService, useValue: service }] });
  });
  it('renders mock trip cards and sends deletion only after confirmation', async () => {
    const fixture = TestBed.createComponent(TripListComponent); await fixture.whenStable();
    const card = fixture.nativeElement.querySelector('app-trip-card');
    expect(card.textContent).toContain('Mock Reef'); expect(card.textContent).toContain('$999');
    service.deleteTrip.mockClear();
    card.querySelector('button').click(); await fixture.whenStable();
    expect(service.deleteTrip).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('section button').click(); await fixture.whenStable();
    expect(service.deleteTrip).toHaveBeenCalledWith('MOCK-REEF');
    expect(fixture.nativeElement.querySelector('app-trip-card')).toBeNull();
  });
  it('renders a retry message when the API is unavailable', async () => {
    service.getTrips.mockReturnValue(throwError(() => new Error('Offline')));
    const fixture = TestBed.createComponent(TripListComponent); await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Unable to load trips');
  });
});
