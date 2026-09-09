import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

// Rutas de auth que nunca deben disparar el flujo de refresh-y-reintentar
// (evita un loop infinito: si /auth/refresh mismo devuelve 401, no hay a
// dónde refrescar).
const RUTAS_SIN_MANEJO_401 = ['/auth/refresh', '/auth/login', '/auth/register'];

/**
 * Maneja los dos casos de error verdaderamente globales (afectan a toda la
 * app, no a una sola acción del usuario):
 *
 * 1. La API no responde en absoluto (status 0 con el navegador en línea) —
 *    típico de Render despertando de estar dormido, timeout, o el server
 *    caído. Distinto de "sin conexión" (eso lo cubre ConectividadService
 *    con el banner global, basado en navigator.onLine).
 * 2. El access token expiró (401) — se intenta renovar con el refresh
 *    token de la cookie; si también falla, la sesión se da por vencida.
 *
 * Deliberadamente NO redirige de página completa ante 403/500 de una
 * request cualquiera (ej. una mutación que falla) — eso es responsabilidad
 * del componente que la disparó, mostrar un error inline/toast tiene mejor
 * UX que sacar al usuario de donde estaba. Las páginas
 * /errores/sin-permiso y /errores/error-inesperado existen para cuando un
 * route guard/resolver (carga de datos al navegar, no una acción puntual)
 * decida usarlas explícitamente.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      if (error.status === 0 && navigator.onLine) {
        void router.navigateByUrl('/errores/servicio-no-disponible');
        return throwError(() => error);
      }

      const esLlamadaDeAuth = RUTAS_SIN_MANEJO_401.some((ruta) => req.url.includes(ruta));

      if (error.status === 401 && !esLlamadaDeAuth) {
        return from(authService.refresh()).pipe(
          switchMap(() => {
            const token = authService.accessToken();
            const reintento = token
              ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
              : req;
            return next(reintento);
          }),
          catchError((refreshError) => {
            authService.clearSession();
            void router.navigateByUrl('/errores/sesion-expirada');
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
