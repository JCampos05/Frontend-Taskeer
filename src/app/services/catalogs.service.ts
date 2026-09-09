import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import { Country, Timezone } from '../models/catalog';

@Injectable({ providedIn: 'root' })
export class CatalogsService {
  private readonly http = inject(HttpClient);

  private paisesCache: Promise<Country[]> | null = null;
  private zonasCache: Promise<Timezone[]> | null = null;

  // Catálogos estáticos — cambian tan poco que cachear en memoria durante
  // la sesión evita pedirlos de nuevo cada vez que se abre configuración.
  listarPaises(): Promise<Country[]> {
    if (!this.paisesCache) {
      this.paisesCache = firstValueFrom(
        this.http.get<{ countries: Country[] }>(`${environment.apiUrl}/catalogs/countries`),
      ).then((r) => r.countries);
    }
    return this.paisesCache;
  }

  listarZonasHorarias(): Promise<Timezone[]> {
    if (!this.zonasCache) {
      this.zonasCache = firstValueFrom(
        this.http.get<{ timezones: Timezone[] }>(`${environment.apiUrl}/catalogs/timezones`),
      ).then((r) => r.timezones);
    }
    return this.zonasCache;
  }
}
