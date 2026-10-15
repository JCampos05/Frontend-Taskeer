import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import { MiSuscripcion, Plan } from '../models/billing';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);

  /** Última suscripción conocida del usuario — la lee el chip del sidebar. */
  readonly suscripcionActual = signal<MiSuscripcion | null>(null);

  async listarPlanes(): Promise<Plan[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ plans: Plan[] }>(`${environment.apiUrl}/billing/plans`),
    );
    return respuesta.plans;
  }

  async miSuscripcion(): Promise<MiSuscripcion> {
    const respuesta = await firstValueFrom(
      this.http.get<{ subscription: MiSuscripcion }>(`${environment.apiUrl}/me/subscription`),
    );
    this.suscripcionActual.set(respuesta.subscription);
    return respuesta.subscription;
  }
}
