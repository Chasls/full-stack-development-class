import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
interface Identity { name: string; email: string; role: string; exp: number; }
@Injectable({providedIn: 'root'})
export class AuthenticationService {
 private http = inject(HttpClient);
 private stored = signal(sessionStorage.getItem('travlr-token') || '');
 private timer?: ReturnType<typeof setTimeout>;
 constructor() { this.scheduleExpiry(); }
 private scheduleExpiry() {
  if (this.timer) clearTimeout(this.timer);
  const identity = this.identity();
  if (identity) this.timer = setTimeout(() => this.logout(), Math.min(identity.exp * 1000 - Date.now(), 2147483647));
  else this.logout();
 }
 identity(): Identity | null {
  try {
   const part = this.stored().split('.')[1];
   const value = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as Identity;
   return value.exp > Date.now() / 1000 ? value : null;
  } catch { return null; }
 }
 token() { if (!this.identity()) {this.logout(); return '';} return this.stored(); }
 isAdmin() { return this.identity()?.role === 'admin'; }
 login(email: string, password: string) {
  return this.http.post<{token: string}>('/api/login', {email, password}).pipe(tap(result => {
   sessionStorage.setItem('travlr-token', result.token); this.stored.set(result.token); this.scheduleExpiry();
  }));
 }
 logout() {if (this.timer) clearTimeout(this.timer); sessionStorage.removeItem('travlr-token'); this.stored.set('');}
}
