import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginaEstado } from '../../../components/principales/pagina-estado/pagina-estado';
import { SvgCandado } from '../../../components/svgs/svg-candado/svg-candado';

@Component({
  selector: 'app-sin-permiso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, RouterLink, SvgCandado],
  template: `
    <app-pagina-estado
      codigo="403"
      titulo="No tienes permiso para ver esto"
      descripcion="Tu rol en este workspace no alcanza para esta acción — si crees que es un error, pídele a quien lo administra que revise tu rol."
    >
      <app-svg-candado ilustracion />
      <a acciones class="boton boton--primario" routerLink="/">Volver al inicio</a>
    </app-pagina-estado>
  `,
})
export class SinPermiso {}
