import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Board } from '../../../models/board';
import { Workspace } from '../../../models/workspace';

/** Diálogo para mover un tablero a otro workspace (donde el usuario sea
 * propietario o administrador). Solo presentación: quien lo usa hace la
 * petición. */
@Component({
  selector: 'app-modal-mover-tablero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus],
  templateUrl: './modal-mover-tablero.html',
  styleUrl: './modal-mover-tablero.css',
  host: { '(document:keydown.escape)': 'cancelar.emit()' },
})
export class ModalMoverTablero {
  readonly tablero = input.required<Board>();
  readonly destinos = input<Workspace[]>([]);
  readonly procesando = input(false);

  /** Emite el id del workspace destino elegido. */
  readonly confirmar = output<string>();
  readonly cancelar = output<void>();

  private readonly destinoElegido = signal<string | null>(null);

  protected readonly destinoId = computed<string | null>(() => {
    const elegido = this.destinoElegido();
    const lista = this.destinos();
    if (elegido && lista.some((d) => d.id === elegido)) return elegido;
    return lista[0]?.id ?? null;
  });

  protected elegirDestino(id: string): void {
    this.destinoElegido.set(id);
  }

  protected enviar(): void {
    const destino = this.destinoId();
    if (!destino || this.procesando()) return;
    this.confirmar.emit(destino);
  }
}
