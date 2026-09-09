import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../auth/environment/environment';
import { AppNotification } from '../models/notification';
import { NotificationsService } from './notifications.service';
import { ToastService } from './toast.service';

const REINTENTO_BASE_MS = 5000;
const REINTENTO_MAX_MS = 60_000;

/**
 * Cliente de `GET /notifications/stream` (Server-Sent Events) — entrega en
 * vivo de notificaciones mientras la app está abierta. Reemplaza al
 * WebSocket original (ver docs/01-arquitectura.md): el canal siempre fue
 * unidireccional, así que SSE es más simple y, sobre todo, más seguro de
 * autenticar — ver el diseño de "ticket" abajo.
 *
 * Por qué un ticket y no el JWT en la URL: `EventSource` no puede mandar
 * headers custom, así que la autenticación tiene que ir en la URL de
 * alguna forma. En vez de exponer ahí el JWT real (que valdría por ~15
 * minutos si alguien lo intercepta — logs de proxies fuera de nuestro
 * control, historial del navegador), se pide primero un ticket de un solo
 * uso y 30 segundos de vida por `POST /notifications/stream-ticket` (esa
 * sí va con el JWT real, pero por header, como cualquier request normal —
 * el interceptor de auth ya se lo pone solo). El ticket en la URL, aunque
 * se filtre, no sirve para nada después de usarse una vez o de que pasen
 * 30 segundos, y nunca da acceso a otro endpoint de la API.
 *
 * Por lo mismo, la reconexión NO puede depender del reintento automático
 * de `EventSource` (que reabriría la misma URL con el mismo ticket ya
 * gastado) — acá se cierra explícitamente en cada error y se reconecta a
 * mano pidiendo un ticket nuevo cada vez.
 *
 * Se conecta explícitamente desde LayoutApp al entrar a la app autenticada
 * y se desconecta al cerrar sesión (ver MenuPerfil.cerrarSesion()) — no se
 * autoconecta solo con estar autenticado, para no abrir un stream en
 * páginas públicas.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsStreamService {
  private readonly http = inject(HttpClient);
  private readonly notificationsService = inject(NotificationsService);
  private readonly toastService = inject(ToastService);

  private eventSource: EventSource | null = null;
  private desconectadoManualmente = false;
  private reintentoTimeout: ReturnType<typeof setTimeout> | null = null;
  private intentosFallidos = 0;

  private readonly conectado = signal(false);
  readonly estaConectado = this.conectado.asReadonly();

  async conectar(): Promise<void> {
    if (this.eventSource) return;

    this.desconectadoManualmente = false;

    let ticket: string;
    try {
      const respuesta = await firstValueFrom(
        this.http.post<{ ticket: string }>(`${environment.apiUrl}/notifications/stream-ticket`, {}),
      );
      ticket = respuesta.ticket;
    } catch {
      // Sin sesión válida (401) u otro fallo — reintenta más tarde en vez
      // de dejar el stream muerto para siempre.
      this.programarReintento();
      return;
    }

    const eventSource = new EventSource(
      `${environment.apiUrl}/notifications/stream?ticket=${ticket}`,
    );
    this.eventSource = eventSource;

    eventSource.addEventListener('open', () => {
      this.conectado.set(true);
      this.intentosFallidos = 0;
    });

    eventSource.addEventListener('notification', (evento) => {
      this.manejarNotificacion((evento as MessageEvent).data);
    });

    // El servidor cierra la conexión proactivamente cada 20 minutos (ver
    // notifications.stream.ts) para que ninguna conexión quede viva
    // indefinidamente sin volver a autenticarse — este evento avisa que
    // fue algo intencional, no una caída de red, así que reconecta de
    // inmediato en vez de esperar el retraso normal.
    eventSource.addEventListener('reauth', () => {
      this.cerrarConexionActual();
      void this.conectar();
    });

    eventSource.onerror = () => {
      // Cierra siempre antes de decidir qué hacer — nunca dejar que el
      // reintento nativo de EventSource reabra la misma URL con el mismo
      // ticket ya consumido.
      this.cerrarConexionActual();
      if (!this.desconectadoManualmente) {
        this.programarReintento();
      }
    };
  }

  desconectar(): void {
    this.desconectadoManualmente = true;
    this.intentosFallidos = 0;
    if (this.reintentoTimeout) {
      clearTimeout(this.reintentoTimeout);
      this.reintentoTimeout = null;
    }
    this.cerrarConexionActual();
  }

  private cerrarConexionActual(): void {
    this.eventSource?.close();
    this.eventSource = null;
    this.conectado.set(false);
  }

  private programarReintento(): void {
    if (this.reintentoTimeout) return;

    // Backoff exponencial con jitter, tope en REINTENTO_MAX_MS — evita que
    // un fallo sostenido del backend (o un 429 del rate limit) genere
    // tráfico constante de reconexión desde cada cliente conectado.
    this.intentosFallidos++;
    const base = Math.min(REINTENTO_BASE_MS * 2 ** (this.intentosFallidos - 1), REINTENTO_MAX_MS);
    const espera = base / 2 + Math.random() * (base / 2);

    this.reintentoTimeout = setTimeout(() => {
      this.reintentoTimeout = null;
      void this.conectar();
    }, espera);
  }

  private manejarNotificacion(data: unknown): void {
    if (typeof data !== 'string') return;

    let notification: AppNotification;
    try {
      notification = JSON.parse(data);
    } catch {
      return;
    }

    this.notificationsService.agregarEnVivo(notification);
    this.toastService.info(notification.body ?? notification.title, {
      titulo: notification.body ? notification.title : undefined,
    });
  }
}
