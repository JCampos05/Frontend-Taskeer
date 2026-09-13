import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import { RecordatorioProximo } from '../models/reminder';

@Injectable({ providedIn: 'root' })
export class RemindersService {
  private readonly http = inject(HttpClient);

  /** Cruza todos los workspaces del usuario — a diferencia del resto de
   * reminders (siempre atados a una tarea puntual, ver views/tablero), esto
   * alimenta el dashboard de Inicio. */
  async listarProximos(): Promise<RecordatorioProximo[]> {
    const respuesta = await firstValueFrom(
      this.http.get<{ reminders: RecordatorioProximo[] }>(
        `${environment.apiUrl}/me/reminders/upcoming`,
      ),
    );
    return respuesta.reminders;
  }
}
