import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@app/services/authService';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  if (token && authService.isTokenExpired(token)) {
    console.error('Token has expired. Redirecting to login.');
    authService.logout();
    return next(req);
  }

  const clonedRequest = req.clone({
    headers: req.headers
      .set('Content-Type', 'application/json')
      .set('Authorization', token ? `Bearer ${token}` : ''),
  });

  return next(clonedRequest);
};
