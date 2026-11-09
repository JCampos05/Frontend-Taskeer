import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SvgFlecha } from '../../svgs/svg-flecha/svg-flecha';
import { RouterLink } from '@angular/router';

/** Link "← volver" del encabezado de una vista — repetido idéntico (mismo
 * markup, mismo CSS) en tablero/miembros/tableros antes de extraerlo. Recibe
 * la ruta como cualquier valor válido de [routerLink] (string o array de
 * segmentos), así que sirve tanto para rutas fijas como con parámetros. */
@Component({
  selector: 'app-boton-volver',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SvgFlecha],
  template: `<a [routerLink]="ruta()" class="volver"><app-svg-flecha class="volver__icono" />{{ etiqueta() }}</a>`,
  styleUrl: './boton-volver.css',
})
export class BotonVolver {
  readonly ruta = input.required<string | unknown[]>();
  readonly etiqueta = input.required<string>();
}
