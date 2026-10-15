import { ListaInvitaciones } from '../../components/secundarios/lista-invitaciones/lista-invitaciones';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
/** Tarea del día unificada: marcada a mano o asignada con fecha. */
interface ItemDia {
  task: TareaEnMiDia['task'];
  board: TareaEnMiDia['board'];
  workspaceId: string;
  fijada: boolean;
}

type IdGrupo = 'vencidas' | 'hoy' | 'proximas' | 'sin-fecha';

interface GrupoDia {
  id: IdGrupo;
  titulo: string;
  items: ItemDia[];
}

@Component({
  selector: 'app-mi-dia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ListaInvitaciones, SvgCampana, SvgEstrellaLlena, SvgUsuarios],
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
  protected readonly errorCarga = signal(false);
  protected readonly pinnedTasks = signal<TareaEnMiDia[]>([]);
  protected readonly assignedTasks = signal<TareaAsignadaConFecha[]>([]);
  protected readonly reminders = signal<MiDiaDto['reminders']>([]);
  protected readonly invitations = signal<MiInvitacion[]>([]);
  protected readonly quitandoTaskId = signal<string | null>(null);
  protected readonly aceptandoInvitacionId = signal<string | null>(null);
  private readonly zonaHoraria = signal<string | null>(null);

  /** Marcadas a mano primero, luego asignadas con fecha, sin repetir. */
  private readonly items = computed<ItemDia[]>(() => {
    const vistas = new Set<string>();
    const lista: ItemDia[] = [];
    for (const p of this.pinnedTasks()) {
      vistas.add(p.task.id);
      lista.push({ task: p.task, board: p.board, workspaceId: p.workspaceId, fijada: true });
    }
    for (const a of this.assignedTasks()) {
      if (vistas.has(a.task.id)) continue;
      vistas.add(a.task.id);
      lista.push({ task: a.task, board: a.board, workspaceId: a.workspaceId, fijada: false });
    }
    return lista;
  });

  /** Vencidas · Hoy · Más adelante · Sin fecha, cada una ordenada por fecha.
   * "Hoy" se calcula en la zona horaria de las preferencias del usuario. */
  protected readonly grupos = computed<GrupoDia[]>(() => {
    const hoy = this.claveDia(new Date().toISOString());
    const buckets: Record<IdGrupo, ItemDia[]> = { vencidas: [], hoy: [], proximas: [], 'sin-fecha': [] };

    for (const item of this.items()) {
      const due = item.task.dueAt;
      if (!due) buckets['sin-fecha'].push(item);
      else if (esFechaVencida(due)) buckets.vencidas.push(item);
      else if (this.claveDia(due) === hoy) buckets.hoy.push(item);
      else buckets.proximas.push(item);
    }

    const porFecha = (a: ItemDia, b: ItemDia) =>
      new Date(a.task.dueAt ?? 0).getTime() - new Date(b.task.dueAt ?? 0).getTime();
    for (const id of ['vencidas', 'hoy', 'proximas'] as const) buckets[id].sort(porFecha);

    const definicion: { id: IdGrupo; titulo: string }[] = [
      { id: 'vencidas', titulo: 'Vencidas' },
      { id: 'hoy', titulo: 'Hoy' },
      { id: 'proximas', titulo: 'Más adelante' },
      { id: 'sin-fecha', titulo: 'Sin fecha' },
    ];
    return definicion
      .map((g) => ({ ...g, items: buckets[g.id] }))
      .filter((g) => g.items.length > 0);
  });

  /** AAAA-MM-DD del instante en la zona horaria del usuario (o la del navegador). */
  private claveDia(iso: string): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.zonaHoraria() ?? undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso));
  }

  constructor() {
    void this.cargarTodo();
  }

  protected reintentar(): void {
    void this.cargarTodo();
  }

  private async cargarTodo(): Promise<void> {
    this.cargando.set(true);
    this.errorCarga.set(false);
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
      this.errorCarga.set(true);
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

  protected async quitarDeMiDia(taskId: string): Promise<void> {
    if (this.quitandoTaskId()) return;

    this.quitandoTaskId.set(taskId);
    try {
      await this.tasksService.quitarDeMiDia(taskId);
      this.pinnedTasks.update((lista) => lista.filter((t) => t.task.id !== taskId));
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
