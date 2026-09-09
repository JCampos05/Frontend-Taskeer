import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import { Preferences, UpdatePreferencesInput } from '../models/preferences';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly http = inject(HttpClient);

  private readonly preferences = signal<Preferences | null>(null);

  readonly preferencesActuales = this.preferences.asReadonly();

  async cargar(): Promise<Preferences> {
    const respuesta = await firstValueFrom(
      this.http.get<{ preferences: Preferences }>(`${environment.apiUrl}/me/preferences`),
    );
    this.preferences.set(respuesta.preferences);
    return respuesta.preferences;
  }

  async actualizar(input: UpdatePreferencesInput): Promise<Preferences> {
    const respuesta = await firstValueFrom(
      this.http.patch<{ preferences: Preferences }>(`${environment.apiUrl}/me/preferences`, input),
    );
    this.preferences.set(respuesta.preferences);
    return respuesta.preferences;
  }
}
