import { HttpErrorResponse } from '@angular/common/http';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ModalConfirmacion } from '../../components/modales/modal-confirmacion/modal-confirmacion';
import { ModalTarea, TareaEditable } from '../../components/modales/modal-tarea/modal-tarea';
import { SvgBasura } from '../../components/svgs/svg-basura/svg-basura';
import { SvgLapiz } from '../../components/svgs/svg-lapiz/svg-lapiz';
import { SvgMas } from '../../components/svgs/svg-mas/svg-mas';
import { ErrorApi } from '../../models/auth';
import { BoardDetalle, ColumnaConTareas, TaskResumen } from '../../models/board';
import { WorkspaceMember, WorkspaceRole } from '../../models/workspace';
import { Task } from '../../models/task';
import { AuthService } from '../../services/auth.service';
import { BoardsService } from '../../services/boards.service';
import { CatalogsService } from '../../services/catalogs.service';
import { PreferencesService } from '../../services/preferences.service';
import { TasksService } from '../../services/tasks.service';
import { WorkspacesService } from '../../services/workspaces.service';
import { formatearFechaCorta } from '../../utils/fecha';
import { puedeGestionarTableros, puedeGestionarTareas } from '../../utils/permisos';

@Component({
  selector: 'app-tablero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    SvgMas,
    SvgLapiz,
    SvgBasura,
    ModalConfirmacion,
    ModalTarea,
  ],
  templateUrl: './tablero.html',
  styleUrl: './tablero.css',
})
export class Tablero {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly boardsService = inject(BoardsService);
  private readonly tasksService = inject(TasksService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly catalogsService = inject(CatalogsService);

  protected readonly workspaceId = this.route.snapshot.paramMap.get('workspaceId')!;
  protected readonly boardId = this.route.snapshot.paramMap.get('boardId')!;

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly tablero = signal<BoardDetalle | null>(null);
  protected readonly miembros = signal<WorkspaceMember[]>([]);
  protected readonly miRol = signal<WorkspaceRole | null>(null);
  protected readonly zonaHoraria = signal<string | null>(null);

  protected readonly mostrarFormularioColumna = signal(false);
  protected readonly editandoColumnaId = signal<string | null>(null);
  protected readonly borrandoColumnaId = signal<string | null>(null);

  protected readonly columnaIdCreandoTarea = signal<string | null>(null);
  protected readonly tareaAbierta = signal<TareaEditable | null>(null);
  protected readonly columnaDeTareaAbierta = signal<string | null>(null);

  protected readonly puedeGestionarTableros = puedeGestionarTableros;
  protected readonly puedeGestionarTareas = puedeGestionarTareas;
  protected readonly formatearFechaCorta = formatearFechaCorta;

  protected readonly formularioColumna = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
  });

  protected readonly formularioRenombrarColumna = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
  });

  constructor() {
    void this.cargar();
  }

  private async cargar(): Promise<void> {
    this.cargando.set(true);
    try {
      // LayoutApp ya carga las preferencias al entrar a la app autenticada
      // (ver components/compuestos/layout-app) — reusa ese signal en vez de
      // pedirlas de nuevo si ya están en memoria.
      const preferenciasCacheadas = this.preferencesService.preferencesActuales();

      const [board, miembros, preferencias, zonas] = await Promise.all([
        this.boardsService.obtenerDetalle(this.workspaceId, this.boardId),
        this.workspacesService.listarMiembros(this.workspaceId),
        preferenciasCacheadas ? Promise.resolve(preferenciasCacheadas) : this.preferencesService.cargar(),
        this.catalogsService.listarZonasHorarias(),
      ]);

      this.tablero.set(board);
      this.miembros.set(miembros);

      const yo = this.authService.usuarioActual();
      const membresia = miembros.find((m) => m.userId === yo?.id);
      this.miRol.set(membresia?.role ?? null);

      const zona = zonas.find((z) => z.id === preferencias.timezoneId);
      this.zonaHoraria.set(zona?.ianaName ?? null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.cargando.set(false);
    }
  }

  protected nombreMiembro(userId: string | null): string | null {
    if (!userId) return null;
    return this.miembros().find((m) => m.userId === userId)?.displayName ?? null;
  }

  // --- Columnas ---

  protected async crearColumna(): Promise<void> {
    if (this.formularioColumna.invalid) {
      this.formularioColumna.markAllAsTouched();
      return;
    }

    try {
      const columna = await this.boardsService.crearColumna(
        this.workspaceId,
        this.boardId,
        this.formularioColumna.getRawValue(),
      );
      this.tablero.update((actual) =>
        actual ? { ...actual, columns: [...actual.columns, { ...columna, tasks: [] }] } : actual,
      );
      this.formularioColumna.reset();
      this.mostrarFormularioColumna.set(false);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  protected iniciarRenombrarColumna(columna: ColumnaConTareas): void {
    this.formularioRenombrarColumna.setValue({ name: columna.name });
    this.editandoColumnaId.set(columna.id);
  }

  protected async confirmarRenombrarColumna(columna: ColumnaConTareas): Promise<void> {
    if (this.formularioRenombrarColumna.invalid) {
      this.formularioRenombrarColumna.markAllAsTouched();
      return;
    }

    try {
      const actualizada = await this.boardsService.actualizarColumna(
        this.workspaceId,
        this.boardId,
        columna.id,
        { name: this.formularioRenombrarColumna.getRawValue().name },
      );
      this.tablero.update((actual) =>
        actual
          ? {
              ...actual,
              columns: actual.columns.map((c) =>
                c.id === columna.id ? { ...c, name: actualizada.name } : c,
              ),
            }
          : actual,
      );
      this.editandoColumnaId.set(null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  protected async confirmarBorrarColumna(): Promise<void> {
    const columnaId = this.borrandoColumnaId();
    if (!columnaId) return;

    try {
      await this.boardsService.borrarColumna(this.workspaceId, this.boardId, columnaId);
      this.tablero.update((actual) =>
        actual ? { ...actual, columns: actual.columns.filter((c) => c.id !== columnaId) } : actual,
      );
      this.borrandoColumnaId.set(null);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
      this.borrandoColumnaId.set(null);
    }
  }

  // --- Tareas ---

  protected abrirNuevaTarea(columnaId: string): void {
    this.columnaDeTareaAbierta.set(columnaId);
    this.columnaIdCreandoTarea.set(columnaId);
    this.tareaAbierta.set(null);
  }

  protected abrirTarea(tarea: TaskResumen, columnaId: string): void {
    this.columnaDeTareaAbierta.set(columnaId);
    this.columnaIdCreandoTarea.set(columnaId);
    this.tareaAbierta.set(tarea);
  }

  protected cerrarModalTarea(): void {
    this.tareaAbierta.set(null);
    this.columnaIdCreandoTarea.set(null);
    this.columnaDeTareaAbierta.set(null);
  }

  protected alGuardarTarea(task: Task): void {
    const resumen: TaskResumen = {
      id: task.id,
      columnId: task.columnId,
      title: task.title,
      description: task.description,
      dueAt: task.dueAt,
      position: task.position,
      assigneeId: task.assigneeId,
    };

    this.tablero.update((actual) => {
      if (!actual) return actual;

      const yaExiste = actual.columns.some((c) => c.tasks.some((t) => t.id === task.id));

      return {
        ...actual,
        columns: actual.columns.map((c) => {
          if (yaExiste) {
            if (c.id !== task.columnId) return c;
            return { ...c, tasks: c.tasks.map((t) => (t.id === task.id ? resumen : t)) };
          }
          if (c.id !== resumen.columnId) return c;
          return { ...c, tasks: [...c.tasks, resumen] };
        }),
      };
    });

    this.cerrarModalTarea();
  }

  protected alEliminarTarea(taskId: string): void {
    this.tablero.update((actual) =>
      actual
        ? {
            ...actual,
            columns: actual.columns.map((c) => ({
              ...c,
              tasks: c.tasks.filter((t) => t.id !== taskId),
            })),
          }
        : actual,
    );
    this.cerrarModalTarea();
  }

  protected alSoltar(evento: CdkDragDrop<TaskResumen[]>, columnaDestino: ColumnaConTareas): void {
    if (evento.previousContainer === evento.container) {
      if (evento.previousIndex === evento.currentIndex) return;
      moveItemInArray(evento.container.data, evento.previousIndex, evento.currentIndex);
    } else {
      transferArrayItem(
        evento.previousContainer.data,
        evento.container.data,
        evento.previousIndex,
        evento.currentIndex,
      );
      evento.container.data[evento.currentIndex] = {
        ...evento.container.data[evento.currentIndex],
        columnId: columnaDestino.id,
      };
    }

    // Fuerza a que el signal detecte el cambio: moveItemInArray/transferArrayItem
    // mutan los arrays en el lugar, no crean referencias nuevas — sin esto,
    // con OnPush, la vista no se actualizaría.
    const tareaMovidaId = evento.container.data[evento.currentIndex].id;
    this.tablero.update((actual) => (actual ? { ...actual } : actual));

    this.tasksService
      .mover(tareaMovidaId, { columnId: columnaDestino.id, position: evento.currentIndex })
      .catch(() => {
        this.errorMensaje.set('No se pudo mover la tarea. Se restauró el tablero.');
        void this.cargar();
      });
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos completar la operación. Intenta de nuevo.';
  }
}
