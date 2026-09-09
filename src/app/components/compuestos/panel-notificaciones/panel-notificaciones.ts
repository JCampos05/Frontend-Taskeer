import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SvgBasura } from '../../svgs/svg-basura/svg-basura';
import { SvgCampana } from '../../svgs/svg-campana/svg-campana';
import { SvgCandado } from '../../svgs/svg-candado/svg-candado';
import { SvgCarpetas } from '../../svgs/svg-carpetas/svg-carpetas';
import { SvgEngranaje } from '../../svgs/svg-engranaje/svg-engranaje';
import { SvgInfo } from '../../svgs/svg-info/svg-info';
import { AppNotification, NotificationTipo } from '../../../models/notification';
import { NotificationsService } from '../../../services/notifications.service';
import { NotificationsStreamService } from '../../../services/notifications-stream.service';

type FiltroTab = 'todas' | 'no-leidas';
type FiltroTipo = NotificationTipo | 'TODOS';

const ETIQUETA_TIPO: Record<NotificationTipo, string> = {
  REMINDER: 'Recordatorios',
  INVITATION: 'Invitaciones',
  ROLE_CHANGED: 'Cambios de rol',
  RECOVERY_CODE_USED: 'Seguridad',
  MENTION: 'Menciones',
  TASK_ASSIGNED: 'Tareas asignadas',
};

const FORMATO_FECHA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

@Component({
  selector: 'app-panel-notificaciones',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SvgCampana, SvgCandado, SvgCarpetas, SvgEngranaje, SvgInfo, SvgBasura],
  templateUrl: './panel-notificaciones.html',
  styleUrl: './panel-notificaciones.css',
})
export class PanelNotificaciones {
  protected readonly notificationsService = inject(NotificationsService);
  protected readonly notificationsStreamService = inject(NotificationsStreamService);
  private readonly router = inject(Router);

  protected readonly abierto = signal(false);
  protected readonly filtroTab = signal<FiltroTab>('todas');
  protected readonly filtroTipo = signal<FiltroTipo>('TODOS');
  protected readonly filtroTipoAbierto = signal(false);

  protected readonly etiquetasTipo = ETIQUETA_TIPO;
  protected readonly tiposDisponibles = Object.keys(ETIQUETA_TIPO) as NotificationTipo[];

  protected readonly listaFiltrada = computed(() => {
    const soloNoLeidas = this.filtroTab() === 'no-leidas';
    const tipo = this.filtroTipo();

    return this.notificationsService
      .listaNotificaciones()
      .filter((n) => (soloNoLeidas ? n.readAt === null : true))
      .filter((n) => (tipo === 'TODOS' ? true : n.type === tipo));
  });

  protected abrirPanel(): void {
    this.abierto.set(true);
  }

  protected cerrarPanel(): void {
    this.abierto.set(false);
    this.filtroTipoAbierto.set(false);
  }

  protected async marcarLeida(notification: AppNotification): Promise<void> {
    if (notification.readAt) return;
    try {
      await this.notificationsService.marcarLeida(notification.id);
    } catch {
      // Silencioso: no es crítico, la notificación sigue visible y se
      // puede reintentar.
    }
  }

  /** Click en la tarjeta: siempre marca como leída, y para los tipos que sí
   * tienen un lugar concreto adonde ir (por ahora solo invitaciones — ver
   * "invitaciones para mí" en views/workspaces/), navega ahí y cierra el
   * panel. El resto de los tipos no navega a ningún lado todavía (no
   * inventar un destino para lo que no lo tiene). */
  protected async abrirNotificacion(notification: AppNotification): Promise<void> {
    void this.marcarLeida(notification);

    if (notification.type === 'INVITATION') {
      this.cerrarPanel();
      await this.router.navigateByUrl('/app/workspaces');
    }
  }

  protected async marcarTodasLeidas(): Promise<void> {
    try {
      await this.notificationsService.marcarTodasLeidas();
    } catch {
      // idem
    }
  }

  protected async eliminar(id: string, evento: Event): Promise<void> {
    evento.stopPropagation();
    try {
      await this.notificationsService.eliminar(id);
    } catch {
      // idem
    }
  }

  protected async limpiarLeidas(): Promise<void> {
    try {
      await this.notificationsService.limpiarLeidas();
    } catch {
      // idem
    }
  }

  protected elegirTipo(tipo: FiltroTipo): void {
    this.filtroTipo.set(tipo);
    this.filtroTipoAbierto.set(false);
  }

  protected fechaCorta(iso: string): string {
    return FORMATO_FECHA.format(new Date(iso));
  }
}
