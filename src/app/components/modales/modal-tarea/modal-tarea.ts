import { HttpErrorResponse } from '@angular/common/http';
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
import { Task } from '../../../models/task';
import { WorkspaceMember } from '../../../models/workspace';
import { TasksService } from '../../../services/tasks.service';
import { datetimeLocalAUtcIso, utcIsoADatetimeLocalInput } from '../../../utils/fecha';

// Solo los campos que el formulario necesita — tanto TaskResumen (embebido
// en BoardDetalle, lo que ya tiene cargado el tablero) como Task (el DTO
// completo) los cumplen, así que el tablero no necesita pedir la tarea
// completa por separado solo para abrir este modal.
export type TareaEditable = Pick<Task, 'id' | 'title' | 'description' | 'dueAt' | 'assigneeId'>;

/** Crear/editar/borrar una tarea — se abre desde el kanban en `views/tablero/`
 * al hacer click en "+ tarea" (crear) o en una tarjeta existente (editar).
 * Autocontenido: llama a TasksService directo y emite el resultado para que
 * el tablero actualice su árbol de columnas en memoria sin recargar todo. */
@Component({
  selector: 'app-modal-tarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ModalConfirmacion, SvgBasura, SvgX],
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

  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly confirmandoBorrado = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly esEdicion = computed(() => this.tarea() !== null);

  protected readonly formulario = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(5000)]],
    dueAt: [''],
    assigneeId: [''],
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
      });
    }
    if (this.soloLectura()) {
      this.formulario.disable();
    }
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
        });
      } else {
        resultado = await this.tasksService.crear({
          columnId: this.columnaId(),
          title: valores.title,
          description: valores.description.trim() || undefined,
          dueAt: dueAt ?? undefined,
          assigneeId: valores.assigneeId || undefined,
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
