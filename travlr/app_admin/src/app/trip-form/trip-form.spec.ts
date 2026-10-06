import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TripFormComponent } from './trip-form';
import { TripDataService } from '../services/trip-data';
const trip = { code: 'MOCK-REEF', name: 'Mock Reef', length: '5 days', start: '2027-09-10T00:00:00.000Z', resort: 'Lagoon Resort', perPerson: '$999', image: 'reef1.jpg', description: '<p>A mock trip.</p>' };
describe('Add and edit trip forms', () => {
  function setup(code: string | null) {
    const service = { getTrip: vi.fn(() => of(trip)), addTrip: vi.fn(() => of(trip)), updateTrip: vi.fn(() => of(trip)) };
    TestBed.configureTestingModule({ imports: [TripFormComponent], providers: [provideRouter([]), { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => code } } } }, { provide: TripDataService, useValue: service }] });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(TripFormComponent);
    return { fixture, form: fixture.componentInstance, service };
  }
  it('rejects incomplete forms and sends a valid new trip', () => {
    const { form, service } = setup(null);
    form.save(); expect(service.addTrip).not.toHaveBeenCalled();
    form.form.patchValue({ ...trip, start: '2027-09-10' }); form.save();
    expect(service.addTrip).toHaveBeenCalledWith(trip);
  });
  it('loads an existing trip and sends updated values', () => {
    const { form, service } = setup(trip.code);
    expect(form.form.controls.start.value).toBe('2027-09-10');
    form.form.controls.name.setValue('Updated Reef'); form.save();
    expect(service.updateTrip).toHaveBeenCalledWith({ ...trip, name: 'Updated Reef' });
  });
  it('keeps form values and displays a duplicate-code error', () => {
    const { form, service } = setup(null);
    service.addTrip.mockReturnValue(throwError(() => ({ error: { error: 'Trip code already exists' } })));
    form.form.patchValue({ ...trip, start: '2027-09-10' }); form.save();
    expect(form.error()).toBe('Trip code already exists'); expect(form.saving()).toBe(false);
    expect(form.form.controls.name.value).toBe(trip.name);
  });
});
