import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
interface Customer { _id: string; name: string; email: string; role: string; }
@Component({selector: 'app-customers', imports: [ReactiveFormsModule, RouterLink], templateUrl: './customers.html'})
export class CustomersComponent {
 private http = inject(HttpClient);
 customers = signal<Customer[]>([]); error = signal(''); message = signal(''); loading = signal(true); busy = signal(false);
 editing = signal<Customer | null>(null); pendingDelete = signal<Customer | null>(null);
 form = inject(FormBuilder).nonNullable.group({name: ['', [Validators.required, Validators.maxLength(100)]], email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]]});
 constructor() {this.load();}
 load() {this.error.set(''); this.loading.set(true); this.http.get<Customer[]>('/api/users').subscribe({next: value => {this.customers.set(value); this.loading.set(false);}, error: response => {this.error.set(response.error?.error || 'Customers could not be loaded.'); this.loading.set(false);}});}
 edit(customer: Customer) {this.editing.set(customer); this.form.reset({name: customer.name, email: customer.email}); this.pendingDelete.set(null);}
 save() {
  this.form.markAllAsTouched(); const customer = this.editing(); if(!customer || this.form.invalid || this.busy()) return;
  this.busy.set(true); this.error.set('');
  this.http.put<Customer>('/api/users/' + customer._id, this.form.getRawValue()).subscribe({next: saved => {this.message.set(saved.name + ' updated.'); this.editing.set(null); this.busy.set(false); this.load();}, error: response => {this.error.set(response.error?.error || 'Customer could not be saved.'); this.busy.set(false);}});
 }
 remove() {
  const customer=this.pendingDelete(); if(!customer || this.busy()) return;
  this.busy.set(true); this.error.set('');
  this.http.delete<void>('/api/users/' + customer._id).subscribe({next: () => {this.message.set(customer.name + ' deleted.'); this.pendingDelete.set(null); this.busy.set(false); this.load();}, error: response => {this.error.set(response.error?.error || 'Customer could not be deleted.'); this.busy.set(false);}});
 }
}
