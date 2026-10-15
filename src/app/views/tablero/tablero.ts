import { CdkTrapFocus } from '@angular/cdk/a11y';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragMove,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalConfirmacion } from '../../components/modales/modal-confirmacion/modal-confirmacion';
import { ModalPerfilUsuario } from '../../components/modales/modal-perfil-usuario/modal-perfil-usuario';
import {
  ModalTarea,
  PRIORIDADES,
  TareaEditable,
} from '../../components/modales/modal-tarea/modal-tarea';
import { BotonVolver } from '../../components/secundarios/boton-volver/boton-volver';
import { SvgBasura } from '../../components/svgs/svg-basura/svg-basura';
import { SvgCheck } from '../../components/svgs/svg-check/svg-check';
import { SvgCopiar } from '../../components/svgs/svg-copiar/svg-copiar';
import { SvgEstrella } from '../../components/svgs/svg-estrella/svg-estrella';
import { SvgEstrellaLlena } from '../../components/svgs/svg-estrella-llena/svg-estrella-llena';
import { SvgLapiz } from '../../components/svgs/svg-lapiz/svg-lapiz';
import { SvgMas } from '../../components/svgs/svg-mas/svg-mas';
import { SvgTablero } from '../../components/svgs/svg-tablero/svg-tablero';
import { SvgUsuarios } from '../../components/svgs/svg-usuarios/svg-usuarios';
import { SvgX } from '../../components/svgs/svg-x/svg-x';
import { ErrorApi } from '../../models/auth';
import { BoardDetalle, BoardMemberOverride, ColumnaConTareas, TaskResumen } from '../../models/board';
import { WorkspaceMember, WorkspaceRole } from '../../models/workspace';
import { PrioridadTarea, Task } from '../../models/task';
import { AuthService } from '../../services/auth.service';
import { BoardsService } from '../../services/boards.service';
import { CatalogsService } from '../../services/catalogs.service';
import { NotificationsService } from '../../services/notifications.service';
import { PreferencesService } from '../../services/preferences.service';
import { TasksService } from '../../services/tasks.service';
import { ToastService } from '../../services/toast.service';
import { WorkspacesService } from '../../services/workspaces.service';
import { esFechaVencida, formatearFechaCorta } from '../../utils/fecha';
import { puedeGestionarTableros, puedeGestionarTareas } from '../../utils/permisos';

@Component({
  selector: 'app-tablero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus, 
    ReactiveFormsModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    SvgMas,
    SvgLapiz,
    SvgBasura,
    SvgUsuarios,
    SvgX,
    SvgCopiar,
    SvgCheck,
    SvgEstrella,
    SvgEstrellaLlena,
    SvgTablero,
    BotonVolver,
    ModalConfirmacion,
    ModalTarea,
    ModalPerfilUsuario,
  ],
  templateUrl: './tablero.html',
  styleUrl: './tablero.css',
  host: { '(document:keydown.escape)': 'alPresionarEscape()' },
})
export class Tablero {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly boardsService = inject(BoardsService);
  private readonly tasksService = inject(TasksService);
  private readonly toastService = inject(ToastService);
  private readonly preferencesService = inject(PreferencesService);
  private readonly catalogsService = inject(CatalogsService);
  private readonly notificationsService = inject(NotificationsService);

  protected readonly workspaceId = this.route.snapshot.paramMap.get('workspaceId')!;
  protected readonly boardId = this.route.snapshot.paramMap.get('boardId')!;

  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly tablero = signal<BoardDetalle | null>(null);
  protected readonly miembros = signal<WorkspaceMember[]>([]);
  // Rol de WORKSPACE crudo — usarlo solo para decidir quién puede gestionar
  // los overrides de rol por board (esa gestión nunca es overridable, ver
  // docs/02-modelo-datos.md). Para cualquier otro permiso dentro de ESTE
  // board (columnas, tareas), usar miRolEfectivo() de abajo.
  protected readonly miRol = signal<WorkspaceRole | null>(null);
  /** Rol EFECTIVO en este board puntual — el que manda `tablero()` ya
   * resuelto contra un posible BoardMemberOverride. Antes de que el board
   * cargue, cae a `miRol()` para no ocultar de más mientras carga. */
  protected readonly miRolEfectivo = computed<WorkspaceRole | null>(
    () => this.tablero()?.viewerEffectiveRole ?? this.miRol(),
  );
  /** Ver/gestionar el panel de roles por tablero exige AMBOS: rol de
   * workspace OWNER/ADMIN (nunca overridable, ver miRol() arriba) Y rol
   * EFECTIVO OWNER/ADMIN en este board puntual. El segundo chequeo es lo
   * que oculta el panel a un ADMIN real de workspace a quien otro admin
   * restringió en este board — sin él, esa persona vería el panel gracias
   * a su rol de workspace y podría revertirse su propia restricción, que
   * es justo lo que la restricción quiere evitar. Mismo criterio aplicado
   * en el Backend (ver boards.service.ts::requireCanManageBoardOverrides).
   * Es solo UX — el Backend es quien realmente lo exige. */
  protected readonly puedeGestionarRolesDeTablero = computed(
    () => puedeGestionarTableros(this.miRol()) && puedeGestionarTableros(this.miRolEfectivo()),
  );
  protected readonly zonaHoraria = signal<string | null>(null);

  protected readonly mostrarFormularioColumna = signal(false);
  protected readonly editandoColumnaId = signal<string | null>(null);
  protected readonly borrandoColumnaId = signal<string | null>(null);

  // Como máximo un aviso de "columna llena" por gesto de arrastre completo
  // — ver alArrastrar(). Sin esto, pasar de una columna a otra ATRAVESANDO
  // una columna llena en el medio (ej. de "Por hacer" a "Hecho" cruzando
  // "En progreso") dispara el aviso una vez por cada entrada/salida que el
  // temblor natural de la mano produce cerca del borde, no una sola vez.
  // Se resetea en alSoltar() al terminar el gesto.
  private avisoLimiteMostradoEnDrag = false;

  protected readonly columnaIdCreandoTarea = signal<string | null>(null);
  protected readonly tareaAbierta = signal<TareaEditable | null>(null);
  protected readonly columnaDeTareaAbierta = signal<string | null>(null);

  // `null` = sin filtro, muestra todas las prioridades.
  protected readonly filtroPrioridad = signal<PrioridadTarea | null>(null);
  protected readonly prioridades = PRIORIDADES;

  // --- Roles por tablero individual (overrides) — solo lo gestiona el
  // OWNER/ADMIN del *workspace* (ver miRol() arriba, nunca miRolEfectivo()).
  protected readonly mostrandoOverrides = signal(false);
  protected readonly cargandoOverrides = signal(false);
  protected readonly overrides = signal<BoardMemberOverride[]>([]);
  protected readonly rolesAsignables: WorkspaceRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];
  // userId cuyo correo se acaba de copiar — mismo patrón de
  // views/configuracion (ver copiarCorreo() ahí): el ícono cambia a un
  // check por 2s, sin tooltip aparte para móvil (sin hover).
  protected readonly correoCopiadoId = signal<string | null>(null);
  protected readonly verPerfilDe = signal<WorkspaceMember | null>(null);

  /** Totales del tablero para el encabezado. "Vencidas" excluye las tareas
   * que ya están en una columna de completadas, igual que las tarjetas. */
  protected readonly resumen = computed(() => {
    const detalle = this.tablero();
    if (!detalle) return null;
    let total = 0;
    let completadas = 0;
    let vencidas = 0;
    for (const columna of detalle.columns) {
      for (const tarea of columna.tasks) {
        total += 1;
        if (columna.isDoneColumn) {
          completadas += 1;
        } else if (tarea.dueAt && esFechaVencida(tarea.dueAt)) {
          vencidas += 1;
        }
      }
    }
    return { total, completadas, vencidas };
  });

  protected readonly puedeGestionarTableros = puedeGestionarTableros;
  protected readonly puedeGestionarTareas = puedeGestionarTareas;
  protected readonly formatearFechaCorta = formatearFechaCorta;
  protected readonly esFechaVencida = esFechaVencida;
  protected readonly miId = computed(() => this.authService.usuarioActual()?.id ?? null);

  /** Tareas de una columna que pasan el filtro de prioridad activo — solo
   * para qué se RENDERIZA. Deliberadamente separado de `columna.tasks`
   * (que se sigue usando tal cual en columnaLlena/predicadoEntradaColumna):
   * el filtro es puramente visual, no debe alterar el conteo real contra el
   * límite WIP de la columna. Filtrado client-side, ya está todo cargado de
   * una sola vez con el detalle del board. */
  protected tareasVisibles(columna: ColumnaConTareas): TaskResumen[] {
    const filtro = this.filtroPrioridad();
    return filtro ? columna.tasks.filter((t) => t.priority === filtro) : columna.tasks;
  }

  protected readonly formularioColumna = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
  });

  protected readonly formularioRenombrarColumna = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    // Angular convierte automáticamente un <input type="number"> vacío a
    // `null` (NumberValueAccessor) — exactamente lo que el Backend
    // interpreta como "sin límite" al mandarlo explícito (distinto de
    // omitir el campo, que significa "no toques el valor actual").
    wipLimit: this.fb.control<number | null>(null, [Validators.min(1)]),
    isDoneColumn: this.fb.nonNullable.control(false),
  });

  // Cantidad de notificaciones ya vistas al momento de montar este
  // componente — el efecto de abajo solo reacciona a notificaciones NUEVAS
  // (llegadas después de este punto), no al historial que NotificationsService
  // ya tenía cargado de antes.
  private cantidadNotificacionesVistas = this.notificationsService.listaNotificaciones().length;

  constructor() {
    void this.cargar();

    // Sin esto, si a alguien le cambian su rol de workspace o su override
    // de rol en ESTE board mientras tiene el tablero abierto en otra
    // pestaña, esa pestaña queda con `miRolEfectivo()` desactualizado hasta
    // que recargue a mano — bug real reportado por el usuario probando
    // roles por tablero (dos sesiones mostraban roles inconsistentes entre
    // sí). No filtra por board/workspace (Notification no guarda esa
    // referencia) — cualquier ROLE_CHANGED nuevo mientras se está viendo
    // un tablero dispara un recargado; en el peor caso es una recarga de
    // más, nunca de menos.
    effect(() => {
      const lista = this.notificationsService.listaNotificaciones();
      if (lista.length > this.cantidadNotificacionesVistas && lista[0]?.type === 'ROLE_CHANGED') {
        void this.cargar();
      }
      this.cantidadNotificacionesVistas = lista.length;
    });
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

  protected etiquetaPrioridad(prioridad: PrioridadTarea): string {
    return this.prioridades.find((p) => p.valor === prioridad)?.etiqueta ?? prioridad;
  }

  protected cambiarFiltroPrioridad(evento: Event): void {
    const valor = (evento.target as HTMLSelectElement).value as PrioridadTarea | '';
    this.filtroPrioridad.set(valor || null);
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
      this.toastService.exito(`Columna "${columna.name}" creada.`);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  protected iniciarRenombrarColumna(columna: ColumnaConTareas): void {
    this.formularioRenombrarColumna.setValue({
      name: columna.name,
      wipLimit: columna.wipLimit,
      isDoneColumn: columna.isDoneColumn,
    });
    this.editandoColumnaId.set(columna.id);
  }

  protected async confirmarRenombrarColumna(columna: ColumnaConTareas): Promise<void> {
    if (this.formularioRenombrarColumna.invalid) {
      this.formularioRenombrarColumna.markAllAsTouched();
      return;
    }

    try {
      const valores = this.formularioRenombrarColumna.getRawValue();
      const actualizada = await this.boardsService.actualizarColumna(
        this.workspaceId,
        this.boardId,
        columna.id,
        { name: valores.name, wipLimit: valores.wipLimit, isDoneColumn: valores.isDoneColumn },
      );
      this.tablero.update((actual) =>
        actual
          ? {
              ...actual,
              columns: actual.columns.map((c) =>
                c.id === columna.id
                  ? {
                      ...c,
                      name: actualizada.name,
                      wipLimit: actualizada.wipLimit,
                      isDoneColumn: actualizada.isDoneColumn,
                    }
                  : c,
              ),
            }
          : actual,
      );
      this.editandoColumnaId.set(null);
      this.toastService.exito(`Columna "${actualizada.name}" actualizada.`);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  /** Cuántas tareas más caben en la columna antes de llegar a su
   * `wipLimit` — `null` (sin límite) se trata como espacio infinito. Usado
   * tanto para deshabilitar "+ Tarea" como para el enterPredicate del
   * drag-and-drop. */
  protected columnaLlena(columna: ColumnaConTareas): boolean {
    return columna.wipLimit !== null && columna.tasks.length >= columna.wipLimit;
  }

  /** Bloquea soltar una tarea arrastrada desde OTRA columna si la destino ya
   * está en su límite — reordenar dentro de la misma columna siempre se
   * permite (no cambia cuántas tareas tiene). Solo es UX preventiva: el
   * Backend igual rechaza con 409 si de todos modos se logra soltar (ver
   * tasks.service.ts::assertWipLimitNotReached). */
  /** Bloqueo real (visual + primera línea de defensa antes del 409 del
   * servidor) — deliberadamente SIN efectos secundarios (sin toast acá). CDK
   * evalúa el enterPredicate de TODAS las columnas conectadas
   * (`cdkDropListGroup`) de forma anticipada apenas arranca el arrastre —no
   * solo cuando el puntero pasa realmente por encima—, así que mostrar el
   * aviso desde acá disparaba con solo levantar la tarjeta. El aviso real
   * vive en alArrastrar(), que sigue la posición del puntero de verdad. */
  protected predicadoEntradaColumna(columnaDestino: ColumnaConTareas) {
    return (drag: CdkDrag<TaskResumen>): boolean => {
      const yaEstaEnEstaColumna = columnaDestino.tasks.some((t) => t.id === drag.data.id);
      if (yaEstaEnEstaColumna) return true;
      return !this.columnaLlena(columnaDestino);
    };
  }

  /** Sigue la posición real del puntero mientras se arrastra una tarjeta —
   * a diferencia del enterPredicate (ver arriba), esto solo corre cuando el
   * usuario de verdad mueve el mouse, así que el aviso refleja intención
   * real de soltar ahí, no una precomputación interna de CDK. */
  protected alArrastrar(evento: CdkDragMove<TaskResumen>, columnaOrigen: ColumnaConTareas): void {
    if (this.avisoLimiteMostradoEnDrag) return;

    const elemento = document.elementFromPoint(
      evento.pointerPosition.x,
      evento.pointerPosition.y,
    );
    const columnaId =
      elemento?.closest<HTMLElement>('[data-columna-id]')?.dataset['columnaId'] ?? null;

    if (!columnaId || columnaId === columnaOrigen.id) return;

    const columnaDestino = this.tablero()?.columns.find((c) => c.id === columnaId);
    if (columnaDestino && this.columnaLlena(columnaDestino)) {
      this.avisoLimiteMostradoEnDrag = true;
      this.toastService.advertencia(
        `"${columnaDestino.name}" ya tiene ${columnaDestino.wipLimit} tareas, su límite configurado.`,
      );
    }
  }

  protected async confirmarBorrarColumna(): Promise<void> {
    const columnaId = this.borrandoColumnaId();
    if (!columnaId) return;

    const nombre = this.tablero()?.columns.find((c) => c.id === columnaId)?.name;

    try {
      await this.boardsService.borrarColumna(this.workspaceId, this.boardId, columnaId);
      this.tablero.update((actual) =>
        actual ? { ...actual, columns: actual.columns.filter((c) => c.id !== columnaId) } : actual,
      );
      this.borrandoColumnaId.set(null);
      this.toastService.exito(nombre ? `Columna "${nombre}" eliminada.` : 'Columna eliminada.');
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
    // El conteo de subtareas no viaja en el DTO de Task (guardar/editar el
    // formulario no toca el checklist, eso se gestiona aparte dentro del
    // propio modal) — se preserva el valor que ya estaba en el tablero, o
    // 0/0 si es una tarea recién creada que todavía no puede tener pasos.
    const existente = this.tablero()
      ?.columns.flatMap((c) => c.tasks)
      .find((t) => t.id === task.id);

    const resumen: TaskResumen = {
      id: task.id,
      columnId: task.columnId,
      title: task.title,
      description: task.description,
      dueAt: task.dueAt,
      priority: task.priority,
      position: task.position,
      assigneeId: task.assigneeId,
      subtaskTotal: existente?.subtaskTotal ?? 0,
      subtaskCompletado: existente?.subtaskCompletado ?? 0,
      inMyDay: existente?.inMyDay ?? false,
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

  protected alActualizarProgresoSubtareas(evento: {
    taskId: string;
    total: number;
    completado: number;
  }): void {
    this.tablero.update((actual) =>
      actual
        ? {
            ...actual,
            columns: actual.columns.map((c) => ({
              ...c,
              tasks: c.tasks.map((t) =>
                t.id === evento.taskId
                  ? { ...t, subtaskTotal: evento.total, subtaskCompletado: evento.completado }
                  : t,
              ),
            })),
          }
        : actual,
    );
  }

  protected readonly actualizandoMiDiaId = signal<string | null>(null);

  /** Botón de estrella en la tarjeta del kanban — agrega/quita de "Mi día"
   * sin abrir el modal. `stopPropagation` para que el click no dispare
   * `abrirTarea` (la tarjeta entera es clickeable). Optimista con rollback,
   * mismo patrón que `alternarCompletado` en modal-tarea.ts. */
  protected async alternarMiDiaTarjeta(tarea: TaskResumen, evento: Event): Promise<void> {
    evento.stopPropagation();
    if (this.actualizandoMiDiaId()) return;

    this.actualizandoMiDiaId.set(tarea.id);
    const nuevoEstado = !tarea.inMyDay;
    this.aplicarEstadoMiDia(tarea.id, nuevoEstado);
    try {
      if (nuevoEstado) {
        await this.tasksService.agregarAMiDia(tarea.id);
      } else {
        await this.tasksService.quitarDeMiDia(tarea.id);
      }
    } catch (err) {
      this.aplicarEstadoMiDia(tarea.id, !nuevoEstado);
      this.toastService.error(this.obtenerMensajeError(err));
    } finally {
      this.actualizandoMiDiaId.set(null);
    }
  }

  /** También usado para sincronizar cuando el toggle se hace desde dentro
   * del modal de tarea (ver `(miDiaActualizada)` en tablero.html) — misma
   * tarjeta, dos puntos de entrada. */
  protected aplicarEstadoMiDia(taskId: string, enMiDia: boolean): void {
    this.tablero.update((actual) =>
      actual
        ? {
            ...actual,
            columns: actual.columns.map((c) => ({
              ...c,
              tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, inMyDay: enMiDia } : t)),
            })),
          }
        : actual,
    );
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
    this.avisoLimiteMostradoEnDrag = false;

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
      .catch((err) => {
        // Toast en vez del banner de error de arriba de la página — es una
        // sola acción puntual (mover una tarjeta), no un fallo de carga de
        // toda la vista. Cubre el caso residual donde el bloqueo visual del
        // enterPredicate no alcanzó a prevenir el intento (ej. una carrera
        // real contra otra tarea insertada casi al mismo tiempo).
        this.toastService.error(this.obtenerMensajeError(err));
        void this.cargar();
      });
  }

  // --- Roles por tablero individual (overrides) ---

  /** Escape cierra el drawer de roles, salvo que haya un modal encima (cada
   * modal maneja su propio Escape). */
  alPresionarEscape(): void {
    if (!this.mostrandoOverrides()) return;
    if (this.verPerfilDe() || this.borrandoColumnaId() || this.columnaIdCreandoTarea()) return;
    void this.alternarPanelOverrides();
  }

  protected async alternarPanelOverrides(): Promise<void> {
    const abriendo = !this.mostrandoOverrides();
    this.mostrandoOverrides.set(abriendo);
    if (!abriendo || this.overrides().length > 0) return;

    this.cargandoOverrides.set(true);
    try {
      this.overrides.set(
        await this.boardsService.listarOverridesDeRol(this.workspaceId, this.boardId),
      );
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.cargandoOverrides.set(false);
    }
  }

  protected overrideDe(userId: string): BoardMemberOverride | undefined {
    return this.overrides().find((o) => o.userId === userId);
  }

  protected async cambiarOverride(userId: string, evento: Event): Promise<void> {
    const valor = (evento.target as HTMLSelectElement).value as WorkspaceRole | '';

    try {
      if (!valor) {
        await this.boardsService.quitarOverrideDeRol(this.workspaceId, this.boardId, userId);
        this.overrides.update((actuales) => actuales.filter((o) => o.userId !== userId));
      } else {
        const override = await this.boardsService.asignarOverrideDeRol(
          this.workspaceId,
          this.boardId,
          userId,
          valor,
        );
        this.overrides.update((actuales) => [
          ...actuales.filter((o) => o.userId !== userId),
          override,
        ]);
      }
      // El propio rol efectivo (si me lo asigné a mí mismo, u otro cambio
      // que afecte cómo veo este board) puede haber cambiado — recargar
      // trae viewerEffectiveRole actualizado sin tener que recalcularlo acá.
      void this.cargar();
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    }
  }

  protected async copiarCorreoMiembro(userId: string, email: string): Promise<void> {
    await navigator.clipboard.writeText(email);
    this.correoCopiadoId.set(userId);
    setTimeout(() => {
      // Solo limpia si sigue siendo el mismo (por si se copió otro correo
      // mientras corría este timeout).
      if (this.correoCopiadoId() === userId) this.correoCopiadoId.set(null);
    }, 2000);
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos completar la operación. Intenta de nuevo.';
  }
}
