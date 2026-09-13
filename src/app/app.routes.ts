import { Routes } from '@angular/router';
import { authGuard } from './auth/guard/auth.guard';
import { guestGuard } from './auth/guard/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/landing/landing').then((m) => m.Landing),
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./views/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'crear-cuenta',
    loadComponent: () => import('./views/crear-cuenta/crear-cuenta').then((m) => m.CrearCuenta),
    canActivate: [guestGuard],
  },
  {
    path: 'restablecer-contrasena',
    loadComponent: () =>
      import('./views/restablecer-contrasena/restablecer-contrasena').then(
        (m) => m.RestablecerContrasena,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'verificar-correo',
    loadComponent: () =>
      import('./views/verificar-correo/verificar-correo').then((m) => m.VerificarCorreo),
  },
  {
    // A donde Supabase redirige de vuelta tras el login con Google (ver
    // AuthService.continuarConGoogle) — sin guard: todavía no hay sesión de
    // Taskeer en este punto, la sesión solo existe del lado de Supabase.
    path: 'auth/callback',
    loadComponent: () =>
      import('./views/auth-callback/auth-callback').then((m) => m.AuthCallback),
  },
  {
    // Coincide con el link que arma sendWorkspaceInvitationEmail en el
    // Backend (mail.service.ts) — fuera de /app porque quien lo recibe
    // puede no tener sesión activa todavía; authGuard lo manda a /login con
    // returnUrl de vuelta a esta misma URL (con el token incluido) si hace
    // falta, sin necesidad de manejar ese caso acá.
    path: 'invitaciones/aceptar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./views/aceptar-invitacion/aceptar-invitacion').then((m) => m.AceptarInvitacion),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./components/compuestos/layout-app/layout-app').then((m) => m.LayoutApp),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', loadComponent: () => import('./views/inicio/inicio').then((m) => m.Inicio) },
      {
        path: 'workspaces',
        loadComponent: () =>
          import('./views/workspaces/workspaces').then((m) => m.WorkspacesVista),
      },
      {
        path: 'workspaces/:workspaceId',
        loadComponent: () => import('./views/tableros/tableros').then((m) => m.Tableros),
      },
      {
        path: 'workspaces/:workspaceId/miembros',
        loadComponent: () => import('./views/miembros/miembros').then((m) => m.Miembros),
      },
      {
        path: 'workspaces/:workspaceId/boards/:boardId',
        loadComponent: () => import('./views/tablero/tablero').then((m) => m.Tablero),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./views/configuracion/configuracion').then((m) => m.Configuracion),
      },
    ],
  },
  {
    path: 'errores/no-encontrado',
    loadComponent: () =>
      import('./views/errores/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
  },
  {
    path: 'errores/sin-permiso',
    loadComponent: () =>
      import('./views/errores/sin-permiso/sin-permiso').then((m) => m.SinPermiso),
  },
  {
    path: 'errores/error-inesperado',
    loadComponent: () =>
      import('./views/errores/error-inesperado/error-inesperado').then(
        (m) => m.ErrorInesperado,
      ),
  },
  {
    path: 'errores/servicio-no-disponible',
    loadComponent: () =>
      import('./views/errores/servicio-no-disponible/servicio-no-disponible').then(
        (m) => m.ServicioNoDisponible,
      ),
  },
  {
    path: 'errores/sesion-expirada',
    loadComponent: () =>
      import('./views/errores/sesion-expirada/sesion-expirada').then((m) => m.SesionExpirada),
  },
  {
    path: 'errores/sin-conexion',
    loadComponent: () =>
      import('./views/errores/sin-conexion/sin-conexion').then((m) => m.SinConexion),
  },
  // Wildcard: siempre al final — cualquier ruta no reconocida cae en 404.
  {
    path: '**',
    loadComponent: () =>
      import('./views/errores/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
  },
];
