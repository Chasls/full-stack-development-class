import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TripDataService } from '../services/trip-data';

@Component({ selector: 'app-trip-form', imports: [ReactiveFormsModule, RouterLink], templateUrl: './trip-form.html' })
export class TripFormComponent {
  private readonly data = inject(TripDataService);
  private readonly router = inject(Router);
  readonly code = inject(ActivatedRoute).snapshot.paramMap.get('code');
  readonly editing = !!this.code;
  loading = signal(this.editing);
  saving = signal(false);
  error = signal('');
  readonly form = inject(FormBuilder).nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]+$/)]],
    name: ['', Validators.required], length: ['', Validators.required],
    start: ['', Validators.required], resort: ['', Validators.required],
    perPerson: ['', Validators.required], image: ['reef1.jpg', Validators.required],
    description: ['', Validators.required]
  });
  constructor() {
    if (this.code) {
      this.data.getTrip(this.code).subscribe({
        next: trip => { this.form.patchValue({ ...trip, start: trip.start.slice(0, 10) }); this.loading.set(false); },
        error: () => { this.error.set('Trip could not be loaded. Return to the trip list and try again.'); }
      });
    }
  }
  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading() || this.saving()) return;
    this.error.set('');
    this.saving.set(true);
    const trip = this.form.getRawValue();
    trip.start = `${trip.start}T00:00:00.000Z`;
    const request = this.editing ? this.data.updateTrip(trip) : this.data.addTrip(trip);
    request.subscribe({
      next: saved => this.router.navigate(['/'], { state: { message: `${saved.name} ${this.editing ? 'updated' : 'added'} successfully.` } }),
      error: response => { this.error.set(response.error?.error || 'Unable to save trip. Try again.'); this.saving.set(false); }
    });
  }
}
