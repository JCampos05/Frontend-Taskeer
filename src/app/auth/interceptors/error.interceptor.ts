import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

// Rutas de auth que nunca deben disparar el flujo de refresh-y-reintentar:
// un 401 en cualquiera de estas es un rechazo de la propia credencial que se
// está mandando (contraseña, refresh token, token de Google), no un access
// token vencido — reintentar con refresh() solo enmascara el error real
// (terminaba mandando a /errores/sesion-expirada en vez de mostrar el error
// verdadero, ej. INVALID_GOOGLE_TOKEN) y en el caso de /auth/refresh además
// causaría un loop infinito.
const RUTAS_SIN_MANEJO_401 = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/google',
  // Estas dos, aunque requieren sesión activa (JWT válido), devuelven 401
  // INVALID_CREDENTIALS cuando la CONTRASEÑA ACTUAL que se manda en el body
  // es incorrecta — no tiene nada que ver con que el access token haya
  // vencido. Sin esto, un usuario que se equivoca tipeando su contraseña
  // actual vería "sesión expirada" y un logout forzado en vez del error real
  // (mismo bug documentado arriba, solo que activado por una credencial de
  // negocio en vez de por el propio token).
  '/auth/change-password',
  '/auth/recovery-codes/regenerate',
];

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
        // Mismo patrón de returnUrl que auth.guard.ts — sin esto, "Reintentar"
        // en la página de error no tenía a dónde volver más que a sí misma.
        void router.navigate(['/errores/servicio-no-disponible'], {
          queryParams: { returnUrl: router.url },
        });
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
