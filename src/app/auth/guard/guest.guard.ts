import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/** Protege rutas públicas que no tienen sentido con sesión activa (landing,
 * login, crear-cuenta) — si ya está autenticado, lo manda directo a la app. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/app/inicio']);
};
