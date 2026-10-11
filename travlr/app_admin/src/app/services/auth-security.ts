import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from './authentication';
export const adminGuard: CanActivateFn = (_route, state) => {
 const auth = inject(AuthenticationService);
 return auth.isAdmin() || inject(Router).createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
};
export const authInterceptor: HttpInterceptorFn = (request, next) => {
 const auth = inject(AuthenticationService); const router = inject(Router);
 const protectedRequest = (request.url.startsWith('/api/trips') && !['GET', 'HEAD'].includes(request.method)) || request.url.startsWith('/api/users');
 const token = protectedRequest ? auth.token() : '';
 return next(token ? request.clone({setHeaders: {Authorization: `Bearer ${token}`}}) : request).pipe(catchError(error => {
  if (protectedRequest && [401, 403].includes(error.status)) {auth.logout(); void router.navigate(['/login']);}
  return throwError(() => error);
 }));
};
