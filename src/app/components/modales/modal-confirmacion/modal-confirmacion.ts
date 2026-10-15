import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

/** Diálogo de confirmación genérico para acciones destructivas (borrar
 * tablero/columna/tarea) — reutilizable en toda la feature de boards/tasks,
 * ver la regla heurística de "confirmación de acciones destructivas" en
 * docs/06-frontend.md. */
@Component({
  selector: 'app-modal-confirmacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkTrapFocus],
  templateUrl: './modal-confirmacion.html',
  styleUrl: './modal-confirmacion.css',
  host: { '(document:keydown.escape)': 'cancelar.emit()' },
})
export class ModalConfirmacion {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Eliminar');
  readonly confirmando = input(false);
  /** Si se define, el usuario debe escribir exactamente este texto para poder
   * confirmar (acciones muy destructivas, ej. borrar un workspace). */
  readonly textoRequerido = input<string | null>(null);

  protected readonly escrito = signal('');
  protected readonly puedeConfirmar = computed(() => {
    const requerido = this.textoRequerido();
    return requerido === null || this.escrito().trim() === requerido;
  });

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
