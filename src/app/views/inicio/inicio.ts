import { ListaInvitaciones } from '../../components/secundarios/lista-invitaciones/lista-invitaciones';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgAdvertencia } from '../../components/svgs/svg-advertencia/svg-advertencia';
import { SvgCampana } from '../../components/svgs/svg-campana/svg-campana';
import { SvgCarpetas } from '../../components/svgs/svg-carpetas/svg-carpetas';
import { SvgEstrellaLlena } from '../../components/svgs/svg-estrella-llena/svg-estrella-llena';
import { SvgUsuarios } from '../../components/svgs/svg-usuarios/svg-usuarios';
import { PRIORIDADES } from '../../components/modales/modal-tarea/modal-tarea';
import { ErrorApi } from '../../models/auth';
import { MiDia } from '../../models/my-day';
import { RecordatorioProximo } from '../../models/reminder';
import { PrioridadTarea } from '../../models/task';
import { MiInvitacion, Workspace } from '../../models/workspace';
import { esFechaVencida, formatearFechaLegible } from '../../utils/fecha';
import { AuthService } from '../../services/auth.service';
import { CatalogsService } from '../../services/catalogs.service';
import { MiDiaService } from '../../services/my-day.service';
import { PreferencesService } from '../../services/preferences.service';
import { RemindersService } from '../../services/reminders.service';
import { TasksService } from '../../services/tasks.service';
import { ToastService } from '../../services/toast.service';
import { WorkspacesService } from '../../services/workspaces.service';

/** Tarea del día ya normalizada para listarla (marcada a mano o asignada con fecha). */
interface TareaDelDia {
  id: string;
  titulo: string;
  tablero: string;
  workspaceId: string;
  boardId: string;
  prioridad: PrioridadTarea;
  dueAt: string | null;
  fijada: boolean;
}

/** Dashboard de entrada a la app autenticada — antes era un saludo estático
 * con un solo botón a Workspaces. Reúne lo que ya existía disperso en otras
 * vistas (invitaciones pendientes, ya en views/workspaces) más una vista
 * nueva de recordatorios próximos (Backend/src/modules/reminders ya tenía
 * la API completa desde agosto, sin ninguna UI en el Frontend hasta ahora). */
@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ListaInvitaciones, SvgAdvertencia, SvgCampana, SvgCarpetas, SvgEstrellaLlena, SvgUsuarios],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  protected readonly authService = inject(AuthService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly remindersService = inject(RemindersService);
  private readonly tasksService = inject(TasksService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly toastService = inject(ToastService);
  private readonly miDiaService = inject(MiDiaService);

  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal(false);
  protected readonly workspaces = signal<Workspace[]>([]);
  protected readonly recordatorios = signal<RecordatorioProximo[]>([]);
  protected readonly misInvitaciones = signal<MiInvitacion[]>([]);
  protected readonly aceptandoInvitacionId = signal<string | null>(null);
  private readonly zonaHoraria = signal<string | null>(null);
  private readonly miDia = signal<MiDia | null>(null);

  protected readonly hoy = new Date();

  /** Vista previa de "Mi día": marcadas a mano primero, luego asignadas con
   * fecha, sin repetir una tarea que esté en ambas. */
  protected readonly tareasDelDia = computed<TareaDelDia[]>(() => {
    const dia = this.miDia();
    if (!dia) return [];
    const vistas = new Set<string>();
    const lista: TareaDelDia[] = [];
    const agregar = (
      t: { id: string; title: string; priority: PrioridadTarea; dueAt: string | null },
      tablero: { id: string; name: string },
      workspaceId: string,
      fijada: boolean,
    ) => {
      if (vistas.has(t.id)) return;
      vistas.add(t.id);
      lista.push({
        id: t.id,
        titulo: t.title,
        tablero: tablero.name,
        workspaceId,
        boardId: tablero.id,
        prioridad: t.priority,
        dueAt: t.dueAt,
        fijada,
      });
    };
    for (const p of dia.pinnedTasks) agregar(p.task, p.board, p.workspaceId, true);
    for (const a of dia.assignedTasks) agregar(a.task, a.board, a.workspaceId, false);
    return lista;
  });

  // Vencidas a nivel sistema — cualquier tarea asignada al usuario en
  // cualquier workspace propio o compartido, independiente de si está en
  // "Mi día" o no (son dos conceptos distintos, ver tasksService.contarVencidas).
  protected readonly cantidadVencidas = signal(0);

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
      const [workspaces, invitaciones, recordatorios, vencidas, preferencias, zonas, miDia] =
        await Promise.all([
          this.workspacesService.listar(),
          this.workspacesService.misInvitaciones(),
          this.remindersService.listarProximos(),
          this.tasksService.contarVencidas(),
          this.preferencesService.cargar(),
          this.catalogsService.listarZonasHorarias(),
          this.miDiaService.obtener(),
        ]);
      this.miDia.set(miDia);
      this.workspaces.set(workspaces);
      this.misInvitaciones.set(invitaciones);
      this.recordatorios.set(recordatorios);
      this.cantidadVencidas.set(vencidas);
      const zona = zonas.find((z) => z.id === preferencias.timezoneId);
      this.zonaHoraria.set(zona?.ianaName ?? null);
    } catch (err) {
      this.errorCarga.set(true);
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  protected saludo(): string {
    const hora = this.hoy.getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  protected fechaDeHoy(): string {
    const texto = new Intl.DateTimeFormat('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(this.hoy);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  protected etiquetaPrioridad(prioridad: PrioridadTarea): string {
    return PRIORIDADES.find((p) => p.valor === prioridad)?.etiqueta ?? prioridad;
  }

  protected esVencida(iso: string): boolean {
    return esFechaVencida(iso);
  }

  protected formatearFecha(iso: string): string {
    return formatearFechaLegible(iso, this.zonaHoraria());
  }

  protected async aceptarInvitacion(invitacion: MiInvitacion): Promise<void> {
    if (this.aceptandoInvitacionId()) return;

    this.aceptandoInvitacionId.set(invitacion.id);
    try {
      const resultado = await this.workspacesService.aceptarInvitacionPorId(invitacion.id);
      this.misInvitaciones.update((lista) => lista.filter((i) => i.id !== invitacion.id));
      this.workspaces.update((lista) =>
        lista.some((w) => w.id === resultado.workspace.id) ? lista : [resultado.workspace, ...lista],
      );
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
    return 'No pudimos cargar tu inicio. Intenta de nuevo.';
  }
}
