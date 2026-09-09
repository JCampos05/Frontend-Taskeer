import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PaginaEstado } from '../../../components/principales/pagina-estado/pagina-estado';
import { SvgNubeApagada } from '../../../components/svgs/svg-nube-apagada/svg-nube-apagada';

@Component({
  selector: 'app-servicio-no-disponible',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, SvgNubeApagada],
  template: `
    <app-pagina-estado
      titulo="El servicio no responde"
      descripcion="Puede tardar hasta medio minuto en despertar si nadie lo usó en un rato. Intenta de nuevo en unos segundos."
    >
      <app-svg-nube-apagada ilustracion />
      <button acciones type="button" class="boton boton--primario" (click)="reintentar()">
        Reintentar
      </button>
    </app-pagina-estado>
  `,
})
export class ServicioNoDisponible {
  protected reintentar(): void {
    window.location.reload();
  }
}
