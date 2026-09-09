import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import {
  LoginInput,
  LoginResultado,
  RegistroInput,
  RegistroResultado,
  ResendVerificationResultado,
} from '../models/auth';
import { Usuario } from '../models/usuario';

/**
 * Estado de sesión en memoria — el access token NUNCA se guarda en
 * localStorage/sessionStorage (evita robo vía XSS), solo vive en este
 * signal mientras dura la pestaña. El refresh token vive en una cookie
 * httpOnly que el navegador maneja solo (ver Backend/src/modules/auth) —
 * por eso login/refresh/logout van con `withCredentials`.
 *
 * Al recargar la página se pierde el access token en memoria pero no la
 * cookie de refresh — `bootstrap()` (llamado una vez al arrancar la app,
 * ver app.config.ts) intenta renovar la sesión en silencio antes de que el
 * usuario vea nada, para que un refresh de página no lo mande a login sin
 * necesidad.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly token = signal<string | null>(null);
  private readonly user = signal<Usuario | null>(null);

  readonly accessToken = this.token.asReadonly();
  readonly usuarioActual = this.user.asReadonly();
  readonly estaAutenticado = computed(() => this.token() !== null);

  setAccessToken(token: string): void {
    this.token.set(token);
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
  }

  async register(input: RegistroInput): Promise<RegistroResultado> {
    return firstValueFrom(
      this.http.post<RegistroResultado>(`${environment.apiUrl}/auth/register`, input),
    );
  }

  async login(input: LoginInput): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResultado>(`${environment.apiUrl}/auth/login`, input, {
        withCredentials: true,
      }),
    );
    this.token.set(response.accessToken);
    this.user.set(response.user);
  }

  async resendVerification(): Promise<ResendVerificationResultado> {
    return firstValueFrom(
      this.http.post<ResendVerificationResultado>(
        `${environment.apiUrl}/auth/resend-verification`,
        {},
      ),
    );
  }

  async verifyEmail(token: string): Promise<void> {
    await firstValueFrom(
      this.http.get(`${environment.apiUrl}/auth/verify-email`, { params: { token } }),
    );
    // GET /auth/verify-email solo confirma { verified: true }, no devuelve
    // el usuario actualizado — sin esto, el usuario en memoria se quedaba
    // con emailVerifiedAt: null hasta el próximo refresh/recarga, aunque el
    // backend ya lo tuviera verificado (cualquier endpoint que sí lea el
    // usuario fresco de la base, como crear una invitación, funcionaba bien
    // igual; esto solo afectaba lo que la UI mostraba sin recargar).
    this.user.update((actual) =>
      actual ? { ...actual, emailVerifiedAt: new Date().toISOString() } : actual,
    );
  }

  async updateProfile(displayName: string): Promise<void> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ user: Usuario }>(`${environment.apiUrl}/me/profile`, { displayName }),
    );
    this.user.set(respuesta.user);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }),
      );
    } finally {
      this.clearSession();
    }
  }

  /** Renueva la sesión usando el refresh token de la cookie httpOnly. Se
   * usa tanto al arrancar la app (bootstrap) como desde el interceptor de
   * errores ante un 401 — si también falla, la sesión se da por vencida. */
  async refresh(): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<LoginResultado>(
        `${environment.apiUrl}/auth/refresh`,
        {},
        { withCredentials: true },
      ),
    );
    this.token.set(response.accessToken);
    this.user.set(response.user);
  }

  /** Se llama una sola vez al arrancar la app (provideAppInitializer en
   * app.config.ts). Si no hay refresh token válido (usuario nunca logueado,
   * o la cookie venció), falla en silencio — no es un error, es el estado
   * normal de un visitante no autenticado. */
  async bootstrap(): Promise<void> {
    try {
      await this.refresh();
    } catch {
      this.clearSession();
    }
  }
}
