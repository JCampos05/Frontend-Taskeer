import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import { MiDia } from '../models/my-day';

@Injectable({ providedIn: 'root' })
export class MiDiaService {
  private readonly http = inject(HttpClient);

  async obtener(): Promise<MiDia> {
    const respuesta = await firstValueFrom(
      this.http.get<{ myDay: MiDia }>(`${environment.apiUrl}/me/my-day`),
    );
    return respuesta.myDay;
  }
}
