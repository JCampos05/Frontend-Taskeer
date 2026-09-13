import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);

  // Adonde estaba el usuario cuando la API dejó de responder — lo manda
  // error.interceptor.ts al redirigir acá (mismo patrón de returnUrl que
  // auth.guard.ts). Sin esto, "Reintentar" solo recargaba esta misma página
  // de error en vez de volver a donde el usuario estaba.
  private readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/inicio';

  protected reintentar(): void {
    // Recarga completa (no router.navigate) — fuerza a que todos los
    // resolvers/servicios vuelvan a pedir sus datos desde cero, en vez de
    // asumir que el estado en memoria de antes del fallo sigue siendo válido.
    window.location.href = this.returnUrl;
  }
}
