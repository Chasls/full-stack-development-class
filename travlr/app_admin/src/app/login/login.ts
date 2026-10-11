import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication';
@Component({selector: 'app-login', imports: [ReactiveFormsModule], templateUrl: './login.html'})
export class LoginComponent {
 private auth = inject(AuthenticationService); private router = inject(Router); private route = inject(ActivatedRoute);
 error = signal(''); busy = signal(false);
 form = inject(FormBuilder).nonNullable.group({email: ['', [Validators.required, Validators.email]], password: ['', Validators.required]});
 login() {
  this.form.markAllAsTouched(); if (this.form.invalid || this.busy()) return;
  this.busy.set(true); this.error.set('');
  const {email, password} = this.form.getRawValue();
  this.auth.login(email, password).subscribe({next: () => {
   if (!this.auth.isAdmin()) {this.auth.logout(); this.error.set('This account does not have administrator access.'); this.busy.set(false); return;}
   const target = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
   void this.router.navigateByUrl(target.startsWith('/') && !target.startsWith('//') ? target : '/');
  }, error: response => {this.error.set(response.error?.error || 'Unable to log in. Try again.'); this.busy.set(false);} });
 }
}
