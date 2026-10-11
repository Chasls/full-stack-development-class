import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CustomersComponent } from './customers';
const customer={_id:'123',name:'Mock Customer',email:'mock@example.test',role:'user'};
describe('Customer management', () => {
 beforeEach(() => TestBed.configureTestingModule({imports:[CustomersComponent],providers:[provideRouter([]),provideHttpClient(),provideHttpClientTesting()]}));
 afterEach(() => TestBed.inject(HttpTestingController).verify());
 it('loads customers and saves edited details', () => {
  const fixture=TestBed.createComponent(CustomersComponent); const component=fixture.componentInstance; const http=TestBed.inject(HttpTestingController);
  http.expectOne('/api/users').flush([customer]); component.edit(customer); component.form.controls.name.setValue('Updated Customer'); component.save();
  const request=http.expectOne('/api/users/123'); expect(request.request.method).toBe('PUT'); expect(request.request.body.name).toBe('Updated Customer'); request.flush({...customer,name:'Updated Customer'});
  http.expectOne('/api/users').flush([{...customer,name:'Updated Customer'}]); expect(component.message()).toBe('Updated Customer updated.');
 });
 it('requires confirmation before deleting a customer', () => {
  const component=TestBed.createComponent(CustomersComponent).componentInstance; const http=TestBed.inject(HttpTestingController); http.expectOne('/api/users').flush([customer]);
  component.remove(); http.expectNone('/api/users/123'); component.pendingDelete.set(customer); component.remove();
  const request=http.expectOne('/api/users/123'); expect(request.request.method).toBe('DELETE'); request.flush(null,{status:204,statusText:'No Content'});
  http.expectOne('/api/users').flush([]); expect(component.customers()).toEqual([]);
 });
});
