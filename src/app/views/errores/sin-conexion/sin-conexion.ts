import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Location } from '@angular/common';
import { PaginaEstado } from '../../../components/principales/pagina-estado/pagina-estado';
import { SvgSinWifi } from '../../../components/svgs/svg-sin-wifi/svg-sin-wifi';
import { ConectividadService } from '../../../services/conectividad.service';

/** Fallback de página completa para cuando una navegación ocurre estando
 * sin conexión (ej. el usuario abrió un link directo sin red). El caso más
 * común — perder conexión a mitad de sesión — lo cubre el banner global
 * (components/secundarios/banner-sin-conexion/), que no saca al usuario de
 * donde estaba. */
@Component({
  selector: 'app-sin-conexion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PaginaEstado, SvgSinWifi],
  template: `
    <app-pagina-estado
      titulo="Sin conexión a internet"
      descripcion="Revisa tu conexión — en cuanto vuelva, te llevamos de regreso automáticamente."
    >
      <app-svg-sin-wifi ilustracion />
      <button acciones type="button" class="boton boton--primario" (click)="reintentar()">
        Reintentar
      </button>
    </app-pagina-estado>
  `,
})
export class SinConexion {
  private readonly conectividad = inject(ConectividadService);
  private readonly location = inject(Location);

  constructor() {
    effect(() => {
      if (this.conectividad.estaEnLinea()) {
        this.location.back();
      }
    });
  }

  protected reintentar(): void {
    window.location.reload();
  }
}
