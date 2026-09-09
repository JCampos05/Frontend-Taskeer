import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PaginaEstado } from '../../../components/principales/pagina-estado/pagina-estado';
import { SvgAdvertencia } from '../../../components/svgs/svg-advertencia/svg-advertencia';

@Component({
  selector: 'app-error-inesperado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, RouterLink, SvgAdvertencia],
  template: `
    <app-pagina-estado
      codigo="500"
      titulo="Algo salió mal"
      descripcion="Ocurrió un error inesperado de nuestro lado. Ya quedó registrado — intenta de nuevo en un momento."
    >
      <app-svg-advertencia ilustracion />
      <button acciones type="button" class="boton boton--primario" (click)="recargar()">
        Recargar página
      </button>
      <a acciones class="boton boton--secundario" routerLink="/">Volver al inicio</a>
    </app-pagina-estado>
  `,
})
export class ErrorInesperado {
  protected recargar(): void {
    window.location.reload();
  }
}
