import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../environment/environment';

/** Adjunta el JWT de acceso a cada request hacia la API de Taskeer — nunca
 * a orígenes externos (ej. si algún día se llama a un servicio de terceros
 * directo desde el cliente). */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  if (!token || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
