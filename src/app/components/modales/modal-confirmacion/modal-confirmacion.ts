import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Diálogo de confirmación genérico para acciones destructivas (borrar
 * tablero/columna/tarea) — reutilizable en toda la feature de boards/tasks,
 * ver la regla heurística de "confirmación de acciones destructivas" en
 * docs/06-frontend.md. */
@Component({
  selector: 'app-modal-confirmacion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal-confirmacion.html',
  styleUrl: './modal-confirmacion.css',
})
export class ModalConfirmacion {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly textoConfirmar = input('Eliminar');
  readonly confirmando = input(false);

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
