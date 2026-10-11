import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthenticationService } from './authentication';
import { adminGuard, authInterceptor } from './auth-security';
import { TripDataService } from './trip-data';
import { vi } from 'vitest';
const token = (role: string, exp = Date.now()/1000 + 3600) => 'header.' + btoa(JSON.stringify({name: 'Mock Admin', email: 'admin@example.test', role, exp})) + '.signature';
describe('Authentication and protected requests', () => {
 beforeEach(() => {
  sessionStorage.clear();
  TestBed.configureTestingModule({providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()]});
 });
 afterEach(() => {TestBed.inject(HttpTestingController).verify(); TestBed.inject(AuthenticationService).logout();});
 it('stores login token and clears it on logout', () => {
  const auth = TestBed.inject(AuthenticationService); const value = token('admin');
  auth.login('admin@example.test', 'password').subscribe();
  const req = TestBed.inject(HttpTestingController).expectOne('/api/login');
  expect(req.request.body).toEqual({email: 'admin@example.test', password: 'password'}); req.flush({token: value});
  expect(auth.isAdmin()).toBe(true); expect(auth.token()).toBe(value);
  auth.logout(); expect(auth.isAdmin()).toBe(false); expect(sessionStorage.getItem('travlr-token')).toBeNull();
 });
 it('rejects expired and malformed stored tokens', () => {
  sessionStorage.setItem('travlr-token', token('admin', 1));
  expect(TestBed.inject(AuthenticationService).token()).toBe('');
 });
 it('redirects anonymous users from write routes', () => {
  const result = TestBed.runInInjectionContext(() => adminGuard({} as never, {url: '/trips/new'} as never));
  expect(TestBed.inject(Router).serializeUrl(result as never)).toBe('/login?returnUrl=%2Ftrips%2Fnew');
 });
 it('adds bearer tokens only to trip writes and clears rejected sessions', () => {
  sessionStorage.setItem('travlr-token', token('admin'));
  const auth = TestBed.inject(AuthenticationService); const service = TestBed.inject(TripDataService); const http = TestBed.inject(HttpTestingController);
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  service.getTrips().subscribe(); const get = http.expectOne('/api/trips'); expect(get.request.headers.has('Authorization')).toBe(false); get.flush([]);
  service.deleteTrip('MOCK').subscribe({error: () => {}}); const request = http.expectOne('/api/trips/MOCK');
  expect(request.request.headers.get('Authorization')).toBe('Bearer ' + auth.token());
  request.flush({error: 'Expired'}, {status: 401, statusText: 'Unauthorized'});
  expect(auth.isAdmin()).toBe(false); expect(navigate).toHaveBeenCalledWith(['/login']);
 });
});
