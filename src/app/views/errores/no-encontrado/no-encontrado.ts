import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginaEstado } from '../../../components/principales/pagina-estado/pagina-estado';
import { SvgLupa } from '../../../components/svgs/svg-lupa/svg-lupa';

@Component({
  selector: 'app-no-encontrado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, RouterLink, SvgLupa],
  template: `
    <app-pagina-estado
      codigo="404"
      titulo="No encontramos esta página"
      descripcion="El enlace puede estar roto o la página se movió de lugar."
    >
      <app-svg-lupa ilustracion />
      <a acciones class="boton boton--primario" routerLink="/">Volver al inicio</a>
    </app-pagina-estado>
  `,
})
export class NoEncontrado {}
