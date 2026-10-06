import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Trip } from '../models/trip';

@Component({ selector: 'app-trip-card', imports: [DatePipe, RouterLink], templateUrl: './trip-card.html' })
export class TripCardComponent {
  trip = input.required<Trip>();
  deleting = input(false);
  remove = output<Trip>();
}
