import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Link "← volver" del encabezado de una vista — repetido idéntico (mismo
 * markup, mismo CSS) en tablero/miembros/tableros antes de extraerlo. Recibe
 * la ruta como cualquier valor válido de [routerLink] (string o array de
 * segmentos), así que sirve tanto para rutas fijas como con parámetros. */
@Component({
  selector: 'app-boton-volver',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `<a [routerLink]="ruta()" class="volver">← {{ etiqueta() }}</a>`,
  styleUrl: './boton-volver.css',
})
export class BotonVolver {
  readonly ruta = input.required<string | unknown[]>();
  readonly etiqueta = input.required<string>();
}
