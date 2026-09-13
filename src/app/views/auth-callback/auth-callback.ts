import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CodigosRecuperacion } from '../../components/principales/codigos-recuperacion/codigos-recuperacion';
import { PaginaEstado } from '../../components/principales/pagina-estado/pagina-estado';
import { TarjetaAuth } from '../../components/principales/tarjeta-auth/tarjeta-auth';
import { SvgAdvertencia } from '../../components/svgs/svg-advertencia/svg-advertencia';
import { ErrorApi } from '../../models/auth';
import { AuthService } from '../../services/auth.service';

type Estado = 'cargando' | 'codigos' | 'error';

/** A donde el Backend redirige de vuelta al navegador después de Google
 * (GET /auth/google/redirect → Supabase → Google → Supabase → acá). Sin
 * `code_challenge` (PKCE), Supabase usa el flujo implícito: el access token
 * llega directo en el fragmento de la URL (`#access_token=...`), nunca como
 * query param — nunca lo manda al servidor por accidente (los fragmentos no
 * viajan en el request HTTP), pero sí hay que limpiarlo de la barra de
 * direcciones apenas se lee. El query param `state` (distinto del
 * fragmento) es el nonce anti-CSRF que /auth/google/redirect generó — viaja
 * en la query de esta misma URL porque así se lo pidió a Supabase en
 * `redirect_to`, y hay que devolverlo al backend para que lo compare contra
 * su cookie antes de aceptar el token. */
@Component({
  selector: 'app-auth-callback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, TarjetaAuth, RouterLink, SvgAdvertencia, CodigosRecuperacion],
  templateUrl: './auth-callback.html',
  styleUrl: './auth-callback.css',
})
export class AuthCallback {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly estado = signal<Estado>('cargando');
  protected readonly recoveryCodes = signal<string[]>([]);
  // Mensaje específico del error, cuando lo hay — ej. "verifica tu correo
  // local antes de vincular Google" (409 LOCAL_ACCOUNT_EMAIL_NOT_VERIFIED) o
  // "Google no confirma que tu correo esté verificado" (403
  // GOOGLE_EMAIL_NOT_VERIFIED). Sin esto, cualquier error terminaba
  // mostrando el mismo genérico "no pudimos completar el login", perdiendo
  // el mensaje accionable que el Backend ya construyó a propósito.
  protected readonly errorMensaje = signal<string | null>(null);

  constructor() {
    void this.procesar();
  }

  private async procesar(): Promise<void> {
    try {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const state = new URLSearchParams(window.location.search).get('state');

      // Se limpia apenas se lee (fragmento y query), exista o no el token —
      // un access token no debe quedar visible en la barra de direcciones
      // ni en el historial más tiempo del necesario.
      history.replaceState(null, '', window.location.pathname);

      if (hashParams.get('error')) {
        // Supabase/Google mandan el detalle en `error_description` (ej. el
        // usuario canceló el consentimiento) — se usa tal cual si viene.
        this.errorMensaje.set(hashParams.get('error_description'));
        this.estado.set('error');
        return;
      }

      const supabaseAccessToken = hashParams.get('access_token');
      if (!supabaseAccessToken || !state) {
        // Llegó a esta ruta sin pasar por el flujo real (ej. navegación
        // directa) — no hay nada que mandarle al backend.
        this.estado.set('error');
        return;
      }

      const resultado = await this.authService.loginWithGoogle(supabaseAccessToken, state);

      if (resultado.recoveryCodes?.length) {
        this.recoveryCodes.set(resultado.recoveryCodes);
        this.estado.set('codigos');
        return;
      }

      await this.router.navigateByUrl('/app/inicio');
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
      this.estado.set('error');
    }
  }

  private obtenerMensajeError(err: unknown): string | null {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return null;
  }

  protected async continuar(): Promise<void> {
    await this.router.navigateByUrl('/app/inicio');
  }
}
