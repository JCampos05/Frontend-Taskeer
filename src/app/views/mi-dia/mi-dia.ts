import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgCampana } from '../../components/svgs/svg-campana/svg-campana';
import { SvgEstrellaLlena } from '../../components/svgs/svg-estrella-llena/svg-estrella-llena';
import { SvgUsuarios } from '../../components/svgs/svg-usuarios/svg-usuarios';
import { PRIORIDADES } from '../../components/modales/modal-tarea/modal-tarea';
import { ErrorApi } from '../../models/auth';
import { MiDia as MiDiaDto, TareaAsignadaConFecha, TareaEnMiDia } from '../../models/my-day';
import { PrioridadTarea } from '../../models/task';
import { MiInvitacion } from '../../models/workspace';
import { esFechaVencida, formatearFechaLegible } from '../../utils/fecha';
import { CatalogsService } from '../../services/catalogs.service';
import { MiDiaService } from '../../services/my-day.service';
import { PreferencesService } from '../../services/preferences.service';
import { TasksService } from '../../services/tasks.service';
import { ToastService } from '../../services/toast.service';
import { WorkspacesService } from '../../services/workspaces.service';

/** "Mi día": reúne, cruzando todos los workspaces del usuario, lo que marcó
 * a mano (pinnedTasks), lo que tiene asignado con fecha límite, sus
 * recordatorios próximos y sus invitaciones pendientes — ver PENDIENTES.md
 * punto 1 para el diseño completo. Backend: GET /me/my-day (my-day.service.ts),
 * que compone servicios ya existentes de reminders/workspaces/tasks sin
 * duplicar sus reglas de permisos. */
@Component({
  selector: 'app-mi-dia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SvgCampana, SvgEstrellaLlena, SvgUsuarios],
  templateUrl: './mi-dia.html',
  styleUrl: './mi-dia.css',
})
export class MiDia {
  private readonly miDiaService = inject(MiDiaService);
  private readonly tasksService = inject(TasksService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly toastService = inject(ToastService);

  protected readonly cargando = signal(true);
  protected readonly pinnedTasks = signal<TareaEnMiDia[]>([]);
  protected readonly assignedTasks = signal<TareaAsignadaConFecha[]>([]);
  protected readonly reminders = signal<MiDiaDto['reminders']>([]);
  protected readonly invitations = signal<MiInvitacion[]>([]);
  protected readonly quitandoTaskId = signal<string | null>(null);
  protected readonly aceptandoInvitacionId = signal<string | null>(null);
  private readonly zonaHoraria = signal<string | null>(null);

  constructor() {
    void this.cargarTodo();
  }

  private async cargarTodo(): Promise<void> {
    this.cargando.set(true);
    try {
      const [miDia, preferencias, zonas] = await Promise.all([
        this.miDiaService.obtener(),
        this.preferencesService.cargar(),
        this.catalogsService.listarZonasHorarias(),
      ]);
      this.pinnedTasks.set(miDia.pinnedTasks);
      this.assignedTasks.set(miDia.assignedTasks);
      this.reminders.set(miDia.reminders);
      this.invitations.set(miDia.invitations);
      const zona = zonas.find((z) => z.id === preferencias.timezoneId);
      this.zonaHoraria.set(zona?.ianaName ?? null);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  protected formatearFecha(iso: string): string {
    return formatearFechaLegible(iso, this.zonaHoraria());
  }

  protected readonly esFechaVencida = esFechaVencida;

  protected etiquetaPrioridad(prioridad: PrioridadTarea): string {
    return PRIORIDADES.find((p) => p.valor === prioridad)?.etiqueta ?? prioridad;
  }

  protected async quitarDeMiDia(tarea: TareaEnMiDia): Promise<void> {
    if (this.quitandoTaskId()) return;

    this.quitandoTaskId.set(tarea.task.id);
    try {
      await this.tasksService.quitarDeMiDia(tarea.task.id);
      this.pinnedTasks.update((lista) => lista.filter((t) => t.task.id !== tarea.task.id));
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.quitandoTaskId.set(null);
    }
  }

  protected async aceptarInvitacion(invitacion: MiInvitacion): Promise<void> {
    if (this.aceptandoInvitacionId()) return;

    this.aceptandoInvitacionId.set(invitacion.id);
    try {
      const resultado = await this.workspacesService.aceptarInvitacionPorId(invitacion.id);
      this.invitations.update((lista) => lista.filter((i) => i.id !== invitacion.id));
      this.toastService.exito(`Te uniste a "${resultado.workspace.name}".`);
    } catch (err) {
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.aceptandoInvitacionId.set(null);
    }
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos cargar tu día. Intenta de nuevo.';
  }
}
