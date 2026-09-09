import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import { AppNotification } from '../models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);

  private readonly notificaciones = signal<AppNotification[]>([]);
  private readonly cargado = signal(false);

  readonly listaNotificaciones = this.notificaciones.asReadonly();
  readonly haCargado = this.cargado.asReadonly();
  readonly cantidadNoLeidas = computed(
    () => this.notificaciones().filter((n) => n.readAt === null).length,
  );

  async cargar(): Promise<void> {
    const respuesta = await firstValueFrom(
      this.http.get<{ notifications: AppNotification[] }>(`${environment.apiUrl}/notifications`),
    );
    this.notificaciones.set(respuesta.notifications);
    this.cargado.set(true);
  }

  async marcarLeida(id: string): Promise<void> {
    // Optimista: la UI se siente instantánea; si falla, se revierte.
    const anterior = this.notificaciones();
    this.notificaciones.update((lista) =>
      lista.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)),
    );

    try {
      await firstValueFrom(
        this.http.patch(`${environment.apiUrl}/notifications/${id}/read`, {}),
      );
    } catch (err) {
      this.notificaciones.set(anterior);
      throw err;
    }
  }

  async marcarTodasLeidas(): Promise<void> {
    const anterior = this.notificaciones();
    const ahora = new Date().toISOString();
    this.notificaciones.update((lista) => lista.map((n) => ({ ...n, readAt: n.readAt ?? ahora })));

    try {
      await firstValueFrom(this.http.patch(`${environment.apiUrl}/notifications/read-all`, {}));
    } catch (err) {
      this.notificaciones.set(anterior);
      throw err;
    }
  }

  /** Llamado por NotificationsStreamService cuando llega una notificación en vivo —
   * la agrega al principio de la lista, como si se hubiera recargado. */
  agregarEnVivo(notification: AppNotification): void {
    this.notificaciones.update((lista) => [notification, ...lista]);
  }

  async eliminar(id: string): Promise<void> {
    const anterior = this.notificaciones();
    this.notificaciones.update((lista) => lista.filter((n) => n.id !== id));

    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/notifications/${id}`));
    } catch (err) {
      this.notificaciones.set(anterior);
      throw err;
    }
  }

  async limpiarLeidas(): Promise<void> {
    const anterior = this.notificaciones();
    this.notificaciones.update((lista) => lista.filter((n) => n.readAt === null));

    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/notifications/read`));
    } catch (err) {
      this.notificaciones.set(anterior);
      throw err;
    }
  }
}
