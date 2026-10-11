import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app';

describe('Admin shell', () => {
  it('offers navigation to the public website', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([]), provideHttpClient()] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('a[href="/travel"]').textContent).toContain('View public website');
  });
});
