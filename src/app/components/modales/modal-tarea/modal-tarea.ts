import { HttpErrorResponse } from '@angular/common/http';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalConfirmacion } from '../modal-confirmacion/modal-confirmacion';
import { SvgBasura } from '../../svgs/svg-basura/svg-basura';
import { SvgX } from '../../svgs/svg-x/svg-x';
import { ErrorApi } from '../../../models/auth';
import { PrioridadTarea, Subtask, Task } from '../../../models/task';
import { WorkspaceMember } from '../../../models/workspace';
import { TasksService } from '../../../services/tasks.service';
import { datetimeLocalAUtcIso, utcIsoADatetimeLocalInput } from '../../../utils/fecha';

// Solo los campos que el formulario necesita — tanto TaskResumen (embebido
// en BoardDetalle, lo que ya tiene cargado el tablero) como Task (el DTO
// completo) los cumplen, así que el tablero no necesita pedir la tarea
// completa por separado solo para abrir este modal.
export type TareaEditable = Pick<
  Task,
  'id' | 'title' | 'description' | 'dueAt' | 'assigneeId' | 'priority'
>;

// Mismos 4 niveles del enum TaskPriority del Backend — mostrados en este
// orden (de menor a mayor) en el selector del formulario.
export const PRIORIDADES: { valor: PrioridadTarea; etiqueta: string }[] = [
  { valor: 'LOW', etiqueta: 'Baja' },
  { valor: 'MEDIUM', etiqueta: 'Media' },
  { valor: 'HIGH', etiqueta: 'Alta' },
  { valor: 'URGENT', etiqueta: 'Urgente' },
];

/** Crear/editar/borrar una tarea — se abre desde el kanban en `views/tablero/`
 * al hacer click en "+ tarea" (crear) o en una tarjeta existente (editar).
 * Autocontenido: llama a TasksService directo y emite el resultado para que
 * el tablero actualice su árbol de columnas en memoria sin recargar todo. */
@Component({
  selector: 'app-modal-tarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalConfirmacion, SvgBasura, SvgX, CdkDropList, CdkDrag],
  templateUrl: './modal-tarea.html',
  styleUrl: './modal-tarea.css',
})
export class ModalTarea implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);

  /** `null` = modo creación. */
  readonly tarea = input<TareaEditable | null>(null);
  /** Columna donde crear la tarea nueva (ignorado en modo edición). */
  readonly columnaId = input.required<string>();
  readonly miembros = input<WorkspaceMember[]>([]);
  readonly zonaHoraria = input<string | null>(null);
  readonly soloLectura = input(false);

  readonly guardado = output<Task>();
  readonly eliminado = output<string>();
  readonly cerrar = output<void>();
  /** El tablero mantiene su propio conteo de subtareas por tarjeta (para el
   * badge "x/y" del kanban) sin volver a pedir el board entero — se emite
   * cada vez que el checklist cambia mientras el drawer está abierto. */
  readonly subtareasActualizadas = output<{ taskId: string; total: number; completado: number }>();

  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly confirmandoBorrado = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly esEdicion = computed(() => this.tarea() !== null);
  protected readonly prioridades = PRIORIDADES;

  protected readonly formulario = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(5000)]],
    dueAt: [''],
    assigneeId: [''],
    priority: this.fb.nonNullable.control<PrioridadTarea>('MEDIUM'),
  });

  // --- Subtareas (checklist) — solo aplica en modo edición: una tarea
  // nueva todavía no tiene id contra el cual crear subtareas, así que hay
  // que guardarla primero y volver a abrirla para agregarle pasos.
  protected readonly subtareas = signal<Subtask[]>([]);
  protected readonly cargandoSubtareas = signal(false);
  protected readonly agregandoSubtarea = signal(false);
  protected readonly errorSubtareas = signal<string | null>(null);

  protected readonly formularioSubtarea = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
  });

  // Los inputs de señal no están garantizados disponibles en el
  // constructor (solo a partir de ngOnInit, cuando Angular ya terminó de
  // procesar los bindings de la primera pasada) — sin esto, el formulario
  // arrancaba siempre vacío en modo edición porque this.tarea() todavía
  // devolvía el valor por defecto (null) al leerse en el constructor.
  ngOnInit(): void {
    const actual = this.tarea();
    if (actual) {
      this.formulario.setValue({
        title: actual.title,
        description: actual.description ?? '',
        dueAt: actual.dueAt ? utcIsoADatetimeLocalInput(actual.dueAt, this.zonaHoraria()) : '',
        assigneeId: actual.assigneeId ?? '',
        priority: actual.priority,
      });
    }
    if (this.soloLectura()) {
      this.formulario.disable();
    }
    if (actual) {
      void this.cargarSubtareas(actual.id);
    }
  }

  private async cargarSubtareas(taskId: string): Promise<void> {
    this.cargandoSubtareas.set(true);
    try {
      this.subtareas.set(await this.tasksService.listarSubtareas(taskId));
      this.emitirProgresoSubtareas(taskId);
    } catch (err) {
      this.errorSubtareas.set(this.obtenerMensajeError(err));
    } finally {
      this.cargandoSubtareas.set(false);
    }
  }

  private emitirProgresoSubtareas(taskId: string): void {
    const lista = this.subtareas();
    this.subtareasActualizadas.emit({
      taskId,
      total: lista.length,
      completado: lista.filter((s) => s.completed).length,
    });
  }

  protected async agregarSubtarea(): Promise<void> {
    const actual = this.tarea();
    if (!actual || this.formularioSubtarea.invalid || this.agregandoSubtarea()) {
      this.formularioSubtarea.markAllAsTouched();
      return;
    }

    this.agregandoSubtarea.set(true);
    this.errorSubtareas.set(null);
    try {
      const nueva = await this.tasksService.crearSubtarea(actual.id, {
        title: this.formularioSubtarea.getRawValue().title,
      });
      this.subtareas.update((actuales) => [...actuales, nueva]);
      this.formularioSubtarea.reset();
      this.emitirProgresoSubtareas(actual.id);
    } catch (err) {
      this.errorSubtareas.set(this.obtenerMensajeError(err));
    } finally {
      this.agregandoSubtarea.set(false);
    }
  }

  /** Alterna hecho/no-hecho — deliberadamente sin ninguna validación contra
   * en qué columna está la tarea dueña (confirmado explícitamente: el
   * checklist es independiente del estado de la tarea). */
  protected async alternarCompletado(subtarea: Subtask): Promise<void> {
    const nuevoEstado = !subtarea.completed;
    this.subtareas.update((actuales) =>
      actuales.map((s) => (s.id === subtarea.id ? { ...s, completed: nuevoEstado } : s)),
    );
    this.emitirProgresoSubtareas(subtarea.taskId);
    try {
      await this.tasksService.actualizarSubtarea(subtarea.taskId, subtarea.id, {
        completed: nuevoEstado,
      });
    } catch (err) {
      // Revierte el optimistic update si el Backend rechaza el cambio.
      this.subtareas.update((actuales) =>
        actuales.map((s) => (s.id === subtarea.id ? { ...s, completed: !nuevoEstado } : s)),
      );
      this.emitirProgresoSubtareas(subtarea.taskId);
      this.errorSubtareas.set(this.obtenerMensajeError(err));
    }
  }

  protected async eliminarSubtarea(subtarea: Subtask): Promise<void> {
    try {
      await this.tasksService.borrarSubtarea(subtarea.taskId, subtarea.id);
      this.subtareas.update((actuales) => actuales.filter((s) => s.id !== subtarea.id));
      this.emitirProgresoSubtareas(subtarea.taskId);
    } catch (err) {
      this.errorSubtareas.set(this.obtenerMensajeError(err));
    }
  }

  protected alSoltarSubtarea(evento: CdkDragDrop<Subtask[]>): void {
    if (evento.previousIndex === evento.currentIndex) return;

    const actuales = [...this.subtareas()];
    moveItemInArray(actuales, evento.previousIndex, evento.currentIndex);
    this.subtareas.set(actuales);

    const movida = actuales[evento.currentIndex];
    this.tasksService
      .actualizarSubtarea(movida.taskId, movida.id, { position: evento.currentIndex })
      .catch((err) => {
        this.errorSubtareas.set(this.obtenerMensajeError(err));
        void this.cargarSubtareas(movida.taskId);
      });
  }

  protected nombreMiembro(userId: string | null): string | null {
    if (!userId) return null;
    return this.miembros().find((m) => m.userId === userId)?.displayName ?? null;
  }

  protected async guardar(): Promise<void> {
    if (this.formulario.invalid || this.guardando()) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorMensaje.set(null);

    const valores = this.formulario.getRawValue();
    const dueAt = valores.dueAt
      ? datetimeLocalAUtcIso(valores.dueAt, this.zonaHoraria())
      : null;

    try {
      const actual = this.tarea();
      let resultado: Task;
      if (actual) {
        resultado = await this.tasksService.actualizar(actual.id, {
          title: valores.title,
          description: valores.description.trim() || null,
          dueAt,
          assigneeId: valores.assigneeId || null,
          priority: valores.priority,
        });
      } else {
        resultado = await this.tasksService.crear({
          columnId: this.columnaId(),
          title: valores.title,
          description: valores.description.trim() || undefined,
          dueAt: dueAt ?? undefined,
          assigneeId: valores.assigneeId || undefined,
          priority: valores.priority,
        });
      }
      this.guardado.emit(resultado);
    } catch (err) {
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.guardando.set(false);
    }
  }

  protected async confirmarBorrado(): Promise<void> {
    const actual = this.tarea();
    if (!actual || this.eliminando()) return;

    this.eliminando.set(true);
    try {
      await this.tasksService.borrar(actual.id);
      this.eliminado.emit(actual.id);
    } catch (err) {
      this.confirmandoBorrado.set(false);
      this.errorMensaje.set(this.obtenerMensajeError(err));
    } finally {
      this.eliminando.set(false);
    }
  }

  private obtenerMensajeError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const cuerpo = err.error as ErrorApi | undefined;
      if (cuerpo?.error?.message) return cuerpo.error.message;
    }
    return 'No pudimos completar la operación. Intenta de nuevo.';
  }
}
