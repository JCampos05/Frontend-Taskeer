import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Workspace } from '../../../models/workspace';

export type AccionTableros = 'mover' | 'eliminar';

export interface ConfirmacionEliminarWorkspace {
  accion: AccionTableros;
  /** Workspace al que se mueven los tableros (solo si accion === 'mover'). */
  destinoId: string | null;
}

/** Diálogo para eliminar un workspace decidiendo qué pasa con sus tableros:
 * moverlos a otro workspace (recomendado) o eliminarlos junto con él. Pide
 * escribir el nombre del workspace para confirmar. Solo presentación: quien lo
 * usa ejecuta el movimiento y el borrado. */
@Component({
  selector: 'app-modal-eliminar-workspace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus],
  templateUrl: './modal-eliminar-workspace.html',
  styleUrl: './modal-eliminar-workspace.css',
  host: { '(document:keydown.escape)': 'cancelar.emit()' },
})
export class ModalEliminarWorkspace {
  readonly workspace = input.required<Workspace>();
  /** Cantidad de tableros que tiene; null mientras se consulta. */
  readonly totalTableros = input<number | null>(null);
  /** Workspaces a los que se podrían mover los tableros (donde el usuario es
   * propietario o administrador, sin contar este). */
  readonly destinos = input<Workspace[]>([]);
  readonly procesando = input(false);

  readonly confirmar = output<ConfirmacionEliminarWorkspace>();
  readonly cancelar = output<void>();

  private readonly accionElegida = signal<AccionTableros | null>(null);
  private readonly destinoElegido = signal<string | null>(null);
  protected readonly escrito = signal('');

  protected readonly hayTableros = computed(() => (this.totalTableros() ?? 0) > 0);
  protected readonly puedeMover = computed(() => this.destinos().length > 0);

  /** Si el usuario no eligió, por defecto se propone mover (lo menos
   * destructivo) cuando hay tableros y adónde llevarlos. */
  protected readonly accion = computed<AccionTableros>(
    () => this.accionElegida() ?? (this.hayTableros() && this.puedeMover() ? 'mover' : 'eliminar'),
  );

  protected readonly destinoId = computed<string | null>(() => {
    const elegido = this.destinoElegido();
    const lista = this.destinos();
    if (elegido && lista.some((d) => d.id === elegido)) return elegido;
    return lista[0]?.id ?? null;
  });

  protected readonly puedeConfirmar = computed(() => {
    if (this.escrito().trim() !== this.workspace().name) return false;
    if (this.hayTableros() && this.accion() === 'mover' && !this.destinoId()) return false;
    // Mientras se consulta cuántos tableros tiene, no se deja confirmar: la
    // decisión depende de ese dato.
    return this.totalTableros() !== null;
  });

  protected textoTableros(): string {
    const total = this.totalTableros();
    if (total === null) return 'Consultando sus tableros…';
    if (total === 0) return 'Este workspace no tiene tableros.';
    return `Este workspace tiene ${total} ${total === 1 ? 'tablero' : 'tableros'}.`;
  }

  protected elegirAccion(accion: AccionTableros): void {
    this.accionElegida.set(accion);
  }

  protected elegirDestino(id: string): void {
    this.destinoElegido.set(id);
  }

  protected enviar(): void {
    if (!this.puedeConfirmar() || this.procesando()) return;
    const mover = this.hayTableros() && this.accion() === 'mover';
    this.confirmar.emit({ accion: mover ? 'mover' : 'eliminar', destinoId: mover ? this.destinoId() : null });
  }
}
